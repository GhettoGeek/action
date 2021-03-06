import relayUnsubscribeAll from 'server/utils/relayUnsubscribeAll'
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler'
import closeTransport from 'server/socketHelpers/closeTransport'

const handleDisconnect = (connectionContext, options = {}) => () => {
  const {exitCode = 1000} = options
  const payload = {
    query: `
    mutation DisconnectSocket {
      disconnectSocket {
        user {
          id
        }
      }
    }
  `
  }
  relayUnsubscribeAll(connectionContext)
  const {socket} = connectionContext
  closeTransport(socket, exitCode)
  clearInterval(connectionContext.cancelKeepAlive)
  wsGraphQLHandler(connectionContext, payload)
}

export default handleDisconnect
