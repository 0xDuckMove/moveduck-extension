import { QUIZ_ACTION,QUIZ_STORAGE_KEY } from "./constants";

export async function actionTracking(action: string, actionId: string): Promise<boolean> {
    try {
    if(action == QUIZ_ACTION) {
      const quizStorage = localStorage.getItem(QUIZ_STORAGE_KEY);
      if(!quizStorage) {
        return true;
      }
      const quizIdList = JSON.parse(quizStorage) as string[];
      if(quizIdList) {
        if(quizIdList.includes(actionId)) {
          return false;
        }
      }
      return true
    }
    return true;
    }catch(e) {
      console.log('error in action tracking', e);
      return false;
    }
  }

export async function saveActionId(actionId: string): Promise<void> {
    try {
        const quizStorage = localStorage.getItem(QUIZ_STORAGE_KEY);
        let quizIdList: string[] = [];
        if (quizStorage) {
            quizIdList = JSON.parse(quizStorage) as string[];
        }
        if (!quizIdList.includes(actionId)) {
            quizIdList.push(actionId);
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizIdList));
        }
    } catch (e) {
        console.log('error in saving action id', e);
    }
}
  