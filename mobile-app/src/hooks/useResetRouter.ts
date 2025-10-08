import {router} from "expo-router";

export const useResetRouter = () => {
    const resetTo = (route: string, params?: any) => {
        if (router.canDismiss()) router.dismissAll()

        router.replace({pathname: route as any, params})
    };

    return {resetTo};
};
