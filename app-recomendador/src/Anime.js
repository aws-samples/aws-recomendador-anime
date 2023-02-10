import * as React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Grid from "@cloudscape-design/components/grid";
import "./Anime.css"
import Similares from "./Similares";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Input from "@cloudscape-design/components/input";

export const Topic = (props) => {

  let { MAL_ID } = useParams();
  console.log(MAL_ID)
  let tempAnime = {
    Genres: "Action, Sci-Fi, Dementia, Psychological, Drama, Mecha",
    MAL_ID: "30",
    Name: "Neon Genesis Evangelion",
    Name_lower: "neon genesis evangelion",
    Score: "8.32",
    personalizescore: 0.1603356,
    sypnopsis: "In the year 2015, the world stands on the brink of destruction. Humanity's last hope lies in the hands of Nerv, a special agency under the United Nations, and their Evangelions, giant machines capable of defeating the Angels who herald Earth's ruin. Gendou Ikari, head of the organization, seeks compatible pilots who can synchronize with the Evangelions and realize their true potential. Aiding in this defensive endeavor are talented personnel Misato Katsuragi, Head of Tactical Operations, and Ritsuko Akagi, Chief Scientist. Face to face with his father for the first time in years, 14-year-old Shinji Ikari's average life is irreversibly changed when he is whisked away into the depths of Nerv, and into a harrowing new destiny—he must become the pilot of Evangelion Unit-01 with the fate of mankind on his shoulders. Written by Hideaki Anno, Neon Genesis Evangelion is a heroic tale of a young boy who will become a legend. But as this psychological drama unfolds, ancient secrets beneath the big picture begin to bubble to the surface..."
  }

  const [animeData, setAnimeData] = React.useState(tempAnime);
  const [message, setMessage] = React.useState("");
  const [messageVisible, setMessageVisible] = React.useState(false);

  const [similarAnimes, setSimilarAnimes] = React.useState([]);
  const [recommendedAnimes, setRecommendedAnimes] = React.useState([]);
  const [visible, setVisible] = React.useState(false);
  const [score, setScore] = React.useState((window.localStorage.getItem('score') == null ? 0 : window.localStorage.getItem('score')));

  const APIS_POST = {
    event_tracker: ""
  }

  const sendEventToPersonalize = (url, eventData) => {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
  }

  const visitarAnime = () => {
    const eventData = {
      "itemId": String(MAL_ID),
      "eventType": "CLICK",
      "eventValue": parseInt(1),
      "sessionId": String(props.session)
    }

    sendEventToPersonalize(props.APIS.tracker + props.user_id, eventData).then((response) => response.json())
      .then((data) => {
        console.log(data)
        if ("RequestId" in data.data.ResponseMetadata) {
          console.log("Anime Visitado!")
        } else {
          setMessage("ocurrió un error")
        }
      });
  }

  const verAnime = () => {
    const eventData = {
      "itemId": String(MAL_ID),
      "eventType": "VIEW",
      "eventValue": parseInt(1),
      "sessionId": String(props.session)
    }

    sendEventToPersonalize(props.APIS.tracker + props.user_id, eventData).then((response) => response.json())
      .then((data) => {
        console.log(data)
        if ("RequestId" in data.data.ResponseMetadata) {
          console.log("Anime Visto!")
        } else {
          setMessage("ocurrió un error")
        }
      });
  }

  const calificarAnime = () => {
    const eventData = {
      "itemId": String(MAL_ID),
      "eventType": "RATING",
      "eventValue": parseInt(score),
      "sessionId": String(props.session)
    }

    sendEventToPersonalize(props.APIS.tracker + props.user_id, eventData).then((response) => response.json())
      .then((data) => {
        console.log(data)
        if ("RequestId" in data.data.ResponseMetadata) {
          setMessage("Anime Calificado!")
        } else {
          setMessage("ocurrió un error")
        }
        setMessageVisible(true)
      });
  }




  useEffect(() => {
    fetch(props.APIS.get_anime + "/" + MAL_ID)

      .then((response) => response.json())
      .then((data) => {
        setAnimeData(data.data);
        console.log(data.data)
      });

    fetch(props.APIS.sims + MAL_ID)

      .then((response) => response.json())
      .then((data) => {
        setSimilarAnimes(data.data.itemList);
        console.log(data.data.itemList)
      });

    fetch(props.APIS.recommend + props.user_id)

      .then((response) => response.json())
      .then((data) => {
        setRecommendedAnimes(data.data.itemList);
        console.log(data.data.itemList)
      });

    fetch(props.APIS.recommend + props.user_id)

      .then((response) => response.json())
      .then((data) => {
        setRecommendedAnimes(data.data.itemList);
        console.log(data.data.itemList)
      });

    //visitar()

  }, []);

  return (
    <Grid className="anime-details"
      gridDefinition={[{ colspan: 12 }, { colspan: 12 }]}
    >
      <div><h1>  **// {animeData.Name} \\**</h1></div>

      <Grid className="anime-details"
        gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}
      >
        <Grid className="anime-details"
          gridDefinition={[{ colspan: 12 }, { colspan: 12 }]}
        >
          <Grid className="anime-details"
            gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}
          >
            <Grid className="anime-details"
              gridDefinition={[{ colspan: 12 }]}
            >
              <div align-items="center">
                <img src="./play_anime.png"
                  alt="Imagen que simula un reproductor de video"
                  onClick={() => {
                    //verAnime()
                  }}
                  object-fit="cover"
                  width="100%"
                  height="100%"></img>

                <Box className="centered-button">
                  <Button onClick={() => { setVisible(true) }} variant="primary" > Calificar </Button>
                </Box>


                <Modal
                  onDismiss={() => setVisible(false)}
                  visible={visible}
                  closeAriaLabel="Close modal"
                  footer={
                    <Box float="right">
                      <SpaceBetween direction="horizontal" size="xs">
                        <Input
                          onChange={({ detail }) => setScore(detail.value)}
                          value={score}
                        />
                        <Button onClick={() => { setVisible(false) }} variant="primary">Cancel</Button>
                        <Button onClick={() => {
                          calificarAnime()
                          setVisible(false)
                          console.log(score)



                        }} variant="primary">Ok</Button>
                      </SpaceBetween>
                    </Box>
                  }
                  header={"Hola, " + props.user_id + " Califica a " + animeData.Name}
                >
                  Ingresa una calificación del 1 al 10. Donde 1 es que te gusto poco y 10 te gusto mucho. (Completed)
                </Modal>

                <Modal
                  onDismiss={() => {
                    setMessageVisible(false)
                    setMessage("")
                  }}
                  visible={messageVisible}
                  closeAriaLabel="Close modal"

                  header={"respuesta"}
                >
                  {message}
                </Modal>

              </div>


            </Grid>
            <Grid className="anime-details"
              gridDefinition={[{ colspan: 12 }, { colspan: 12 }, { colspan: 12 }]}
            >
              <div><h3>{`Calificación de la gente: ${animeData.Score}`}</h3></div>
              <div><h3>Generos:</h3>{animeData.Genres}</div>
              <div>
                <h3>Sinopsis:</h3>
                {`${animeData.sypnopsis}`}</div>
            </Grid>
          </Grid>
          <Similares itemList={recommendedAnimes} titulo={"Recomendaciones personalizadas Para ti"} max_value={8} />
        </Grid>
        <Similares itemList={similarAnimes} titulo={"Animes Similares a " + animeData.Name} max_value={4} />
      </Grid>
    </Grid>
  )


};
