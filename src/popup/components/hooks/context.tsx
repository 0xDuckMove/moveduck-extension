import { createContext, useContext } from "react";

export const ActionContext = createContext<{
    isActionDone: boolean;
    setIsActionDone: React.Dispatch<React.SetStateAction<boolean>>;
  } | null>(null);

export const useActionContext = () => {
    const context = useContext(ActionContext);
    if (!context) {
      throw new Error('useActionContext must be used within an ActionProvider');
    }
return context;}