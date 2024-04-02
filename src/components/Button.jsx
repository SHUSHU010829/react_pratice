import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

let likes = 0;

const mockLikeApi = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.7) {
                console.log('Random API error!')
                reject(new Error('Random API error!'))
            } else {
                likes += 1
                resolve({
                    success: true,
                    totalLikes: likes,
                })
            }
        }, 1000)
    })
}

 const ReactQueryLikeCounter = () => {
    const queryClient = useQueryClient()

    const { data: dbLikes } = useQuery({
        queryKey: ['likes'],
        queryFn: () => likes,
    })

    const { mutate, isLoading } = useMutation({
        mutationFn: async () => {
            const response = await mockLikeApi()
            return response
        },
        onMutate: async () => {
            await queryClient.cancelQueries(['likes'])

            const previousLikes = queryClient.getQueryData (['likes'])

            queryClient.setQueryData(['likes'], (previousLikes || 0) + 1)

            return { previousLikes }
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(['likes'], () => context?.previousLikes)
        },
        onSettled: () => {
            queryClient.invalidateQueries(['likes'])
        },
    })

    return (
        <div>
            <p>Likes: {dbLikes} </p>
            <button onClick={() => mutate()} disabled={isLoading}>{isLoading ? 'Updating' : 'Like'}</button>
        </div>
    )
}

export default ReactQueryLikeCounter