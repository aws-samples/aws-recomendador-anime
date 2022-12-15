import * as React from "react";
import "@cloudscape-design/global-styles/index.css"
import Grid from "@cloudscape-design/components/grid"
import Cards from "./Cards";
import Similares from "./Similares";


import "./App.css"
import Top_4 from "./Top_4";
import Searchresults from "./Searchresults";
import Form_anime from "./form_anime";

import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";




const FILETRS = ["Shounen", "Drama", "Music", "Sci-Fi", "Action"]

const RecommendedAnimesForUser = (props) =>

    <div>
        <Top_4 API={props.api + props.user_id + "?filter=" + props.filter_name} titulo={"Anime de " + props.filter_name + " para ti"} />
    </div>


const AnimeDetails = (props) =>

    <div>
       { props.anime.MAL_ID}
    </div>


export default (props) => {
    const [animeEncontrados, setAnimeEncontrados] = React.useState([]);

    const buscar_animes = (nombre) => {

        fetch(props.APIS.search + "?nombre=" + nombre)
            .then((response) => response.json())
            .then((data) => {



                setAnimeEncontrados(data.data);


                console.log(data.data)// 
            });
    }

    return [
        <Grid key={2}
            disableGutters
            gridDefinition={[
                { colspan: { xxs: 12, m: 12 } },
                { colspan: { xxs: 12, m: 12 } },
                { colspan: { xxs: 12, m: 12 } },
                { colspan: { xxs: 12, m: 12 } }]}
        >



            <div >
                <Form_anime buscar_animes={buscar_animes} />
            </div>

            {animeEncontrados.length ?

                //<Searchresults items={animeEncontrados} titulo="Resultados de la busqueda" />

                <Similares itemList={animeEncontrados} titulo="Resultados de la busqueda" max_value={10}/>

                : FILETRS.map((elem, index) => <RecommendedAnimesForUser api={props.APIS.recommend} user_id={props.user_id} filter_name={elem} key={index} />)}



        </Grid>
    ]

}

/* { "name": "Sci-Fi", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Sci-Fi" }, { "name": "Shounen", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Shounen" }, { "name": "Fantasy", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Fantasy" }, { "name": "Action", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Action" }, { "name": "Comedy", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Comedy" }, { "name": "Adventure", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Adventure" }, { "name": "Kids", "filterArn": "arn:aws:personalize:us-west-2:528681203296:filter/Kids" }] */



