import "@cloudscape-design/global-styles/index.css"
import * as React from "react";

import {
  Routes, 
  Route, 
  Outlet,
  
} from "react-router-dom";
import AppLayout from "@cloudscape-design/components/app-layout"; 
import Home from './Home'


import AppTopNaigation from "./AppTopNaigation";
import "./App.css"
import Top_4 from "./Top_4";
import { Topic } from "./Anime";

const APIS = {
  recommend: "https://Tu-API-ID.amazonaws.com/prod/personalize-anime-userpersonalization/",
  sims: "https://Tu-API-ID.amazonaws.com/prod/personalize-anime-sims/",
  search: "https://Tu-API-ID.amazonaws.com/prod/search/search",
  get_anime: "https://Tu-API-ID.amazonaws.com/prod/anime",
  tracker: "https://Tu-API-ID.amazonaws.com/prod/animetracker/"
}


export default () => {
  const d = new Date()


  const [user_id, setUser_id] = React.useState((window.localStorage.getItem('user_id') == null ? 500000 :window.localStorage.getItem('user_id')));
  const [session, setSesion] = React.useState((window.localStorage.getItem('session') == null ? "500000"+ d.getTime() :window.localStorage.getItem('session')));

  const set_user_id = (new_user_id) => {
    const d = new Date()
    const new_session =String(new_user_id)+d.getTime()

    window.localStorage.setItem('user_id', new_user_id)
    window.localStorage.setItem('session', new_session)

    setUser_id(new_user_id)
    setSesion(new_session)
    console.log("user_id!")
  }
  return (
    <Routes>
      <Route path="/" element = {<Layout  set_user_id = {set_user_id} />}>
        <Route path="/:MAL_ID" element={<Topic APIS={APIS}  user_id={user_id} session={session}/>}>
        </Route>
        <Route index element = {<Home  user_id={user_id} APIS={APIS}/>}/>
        <Route path="/" element = {<Top_4/>}/>
      </Route>
    </Routes>

  );
}

const Layout = (props) => [
  
  <AppTopNaigation key={1} set_user_id= {props.set_user_id} />,
  <AppLayout key={2}
    headerSelector = "#h"
    toolsHide = {true}
    disableContentPaddings = {true}
    navigationHide = {true}
    footerSelector="#f"
    content = {<Outlet/>}
    
    />,
    <div id="f" key={3} className='App-footer'>
      @2023 Elizabeth Fuentes Leone | AWS Developer Advocate | All Rights Reserved

    </div>

]

const Nomatch = () => <div> Nada por aca </div>