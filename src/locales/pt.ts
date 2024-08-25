export const commands = {
  ban: {
    missing_user: 'Informe um usuário válido.',
    res: '`{user}` (`{id}`) foi banido do servidor por `{reason}`',
    reason: 'Enter a reason.'
  },
  timeout: {
    res: '`{user}` (`{id}`) foi mutado por {time} por `{reason}`',
    time: 'Informe o tempo.'
  },
  unban: {
    res: '`{user}` (`{id}`) foi desbanido do servidor por {author}',
    res2: '`{user}` (`{id}`) foi desbanido do servidor'
  }
}
export const helper = {
  error: 'Ocorreu um erro inesperado...\n```{e}```'
}