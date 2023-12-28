import { ZodError, ZodIssue } from 'zod'

const formatZodIssue = (issue: ZodIssue): string => {
  // const pathString = issue.path.join('.')
  // return `${pathString}: ${issue.message}`
  return issue.message
}

// Format the Zod error message with only the current error
const formatZodError = (error: ZodError): string => {
  const { issues } = error

  if (issues.length) {
    let message = ''
    issues.forEach((issue) => {
      message += formatZodIssue(issue) + '. '
    })

    return message
  }

  return 'Error'
}

export default formatZodError
