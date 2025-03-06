import { SERVER } from "./constants";

export function parseUrl(url: string): {action: string, actionId: string} {
  const actionParams = url.split(SERVER)[1].split('/')[1]
    const actionString = actionParams.split('?')[0];
        if(actionString == 'quiz') {
          const quizId = actionParams.split('=')[1].split('&')[0];
            return {action: actionString, actionId: quizId};
        }
        return {action: actionString, actionId: ''};
}


export function parseUrlFromHashtag(url: string): {action: string, actionId: string} {
  const actionString = url.split(SERVER)[1].split('/')[1]
      if(actionString == 'quiz') {
        const quizId = url.split(SERVER)[1].split('/')[2].split('=')[1];
          return {action: actionString, actionId: quizId};
      }
      return {action: actionString, actionId: ''};
}

export function parsePostUrl(url: string): {action: string, actionId: string} {
   const actionString = url.split(SERVER)[1].split('/')[1];
    console.log('action', actionString);
    if(actionString == 'quiz') {
      const quizId = url.split(SERVER)[1].split('/')[3].split('?')[0];
      return {action: actionString, actionId: quizId};
    }
    return {action: actionString, actionId: ''};
}

export function parseUnknowUrl(apiAction: string):{action: string, actionId: string}   {
  let parsed = {action: '', actionId: ''};
      if(!apiAction.includes('hashtag')) {
         parsed = parseUrl(apiAction);
      }else {
        parsed = parseUrlFromHashtag(apiAction);
      }
      return parsed;
}