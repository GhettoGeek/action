import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {sendLastPromptRemovalError, sendTeamAccessError} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import RemoveReflectTemplatePromptPayload from '../types/RemoveReflectTemplatePromptPayload'

const removeReflectTemplatePrompt = {
  description: 'Remove a prompt from a template',
  type: RemoveReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve (_source, {promptId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await r.table('CustomPhaseItem').get(promptId)

    // AUTH
    if (!prompt || !isTeamMember(authToken, prompt.teamId) || !prompt.isActive) {
      return sendTeamAccessError(authToken, prompt && prompt.teamId)
    }

    // VALIDATION
    const {teamId, templateId} = prompt
    const promptCount = await r
      .table('CustomPhaseItem')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        isActive: true,
        templateId: templateId
      })
      .count()
      .default(0)

    if (promptCount.length <= 1) {
      return sendLastPromptRemovalError(authToken, promptId)
    }

    // RESOLUTION
    await r
      .table('CustomPhaseItem')
      .get(promptId)
      .update({
        isActive: false,
        updatedAt: now
      })

    const data = {promptId, templateId}
    publish(TEAM, teamId, RemoveReflectTemplatePromptPayload, data, subOptions)
    return data
  }
}

export default removeReflectTemplatePrompt
