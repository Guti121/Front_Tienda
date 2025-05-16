import Main from "./src/components/Main";
import store from "./src/redux/store";

export default function App() {
  return (
    
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
