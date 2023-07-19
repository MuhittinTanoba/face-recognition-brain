import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import "tachyons";
import { useState } from "react";


function App() {
  const [input, setInput] = useState("");
  const [box, setBox] = useState({});
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  });

  const initialState = () => {
    setInput("");
    setBox({});
    setRoute("signin");
    setIsSignedIn(false);
    setUser({
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    });
  }

  const loadUser = (data) => {
    setUser({ 
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    })

  }

  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = "7d30c4cf71b64f6da8ad977a799846a9";
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = "muhi_tan_123";
  const APP_ID = "my-first-application-pa5nwl";
  // Change these to whatever model and image URL you want to use
  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
  const IMAGE_URL = input;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };


  const displayFaceBox = (box) => {
    setBox(box);
  };

  const onButtonSubmit = () => {
    fetch(
      "https://api.clarifai.com/v2/models/" +
        MODEL_ID +
        "/versions/" +
        MODEL_VERSION_ID +
        "/outputs",
      requestOptions
    )
    .then((response) => response.json())
      .then((result) => {
        if(result){
          fetch('http://localhost:3000/image', {
            method: "put",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: user.id
            }),
          })
        }
        displayFaceBox(calculateFaceLocation(result));
      })
      .then(count => {
        setUser({
          ...user,
          entries: count
        })
      })
  };

  const onRouteChange = (route) => {
    if (route === "signout") {
      initialState();
    } else if (route === "home") {
      setIsSignedIn(true);
    }

    setRoute(route);
  };
  return (
    <div className="App">
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank name={user.name} entries={user.entries}/>
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={input} />
        </div>
      ) : route === "signin" ? (
        <Signin onRouteChange={onRouteChange} loadUser={loadUser}/>
      ) : (
        <Register onRouteChange={onRouteChange} loadUser={loadUser}/>
      )}
    </div>
  );
}

export default App;
