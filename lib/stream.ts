import { StreamChat } from 'stream-chat'

let streamClient: StreamChat | null = null

export async function getStreamClient(userId: string, userToken: string) {
  if (!streamClient) {
    streamClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!)
  }

  if (!streamClient.userID) {
    await streamClient.connectUser(
      {
        id: userId,
        name: userId,
        image: '',
      },
      userToken
    )
  }

  return streamClient
}

export async function disconnectStream() {
  if (streamClient) {
    await streamClient.disconnectUser()
    streamClient = null
  }
}

export async function generateStreamToken(userId: string) {
  const response = await fetch('/api/stream/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) throw new Error('Failed to generate token')
  const { token } = await response.json()
  return token
}

export async function createStreamChannel(
  channelId: string,
  channelName: string,
  userId: string
) {
  const client = await getStreamClient(userId, await generateStreamToken(userId))
  const channel = client.channel('messaging', channelId, {
    name: channelName,
    members: [userId],
  })

  await channel.create()
  return channel
}

export async function addChannelMember(
  channelId: string,
  userId: string,
  newMemberId: string
) {
  const client = await getStreamClient(userId, await generateStreamToken(userId))
  const channel = client.channel('messaging', channelId)

  await channel.addMembers([newMemberId])
  return channel
}
