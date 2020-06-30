import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';

export interface AccountState {
    id: number;
    login: string;
    sessionId: string;
}

export const initialState: AccountState = {
    id: 0,
    login: "",
    sessionId: "",
};

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // login: (state) => {
        //     state.value += 1;
        // },
        // Use the PayloadAction type to declare the contents of `action.payload`
        setUserData: (state: AccountState, action: PayloadAction<AccountState>) => {
            console.log(action.payload);
            return {
                ...state,
                ...action.payload,
            };
        },
    },
});

export const { setUserData } = accountSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
// export const incrementAsync = (amount: number): AppThunk => dispatch => {
//     setTimeout(() => {
//         //dispatch(incrementByAmount(amount));
//     }, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectAccount = (state: RootState) => state.account;

export default accountSlice.reducer;
