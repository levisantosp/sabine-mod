export const commands = {
  ban: {
    missing_user: 'Enter a valid user.',
    res: '`{user}` (`{id}`) has been banned from the server for `{reason}`',
    reason: 'Enter a reason.'
  },
  timeout: {
    res: '`{user}` (`{id}`) has been timed out for {time} for `{reason}`',
    time: 'Enter the time.'
  },
  unban: {
    res: '`{user}` (`{id}`) has been unbanned from the server by {author}',
    res2: '`{user}` (`{id}`) has been unbanned from the server'
  },
  lang: {
    missing_arg: 'Enter the language.\n`{prefix}lang en` for English; `{prefix}lang pt` for portuguese'
  }
}
export const helper = {
  error: 'An unexpected error has occured...\n```{e}```'
}