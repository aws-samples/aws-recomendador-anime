import * as React from "react";
import "@cloudscape-design/global-styles/index.css";
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";


import Header from "@cloudscape-design/components/header";
import {Link} from "react-router-dom"


  
export default (props) => {

  return (
    
    <Cards

      cardDefinition={{
        header: item => (
          <Link fontSize="heading-m">{item.name}</Link>
        ),
        sections: [
          {
            id: "Name",
            header: "Nombre",
            content: item => item.Name, width: 48
          },
          {
            id: "sypnopsis",
            header: "Sypnopsis",
            content: item => item.sypnopsis.slice(0,100)+"..." , width: 48
          },
          {
            id: "Score",
            header: "Rating",
            content: item => item.Score, width: 48
          },
          {
            id: "Genres",
            header: "Genero",
            content: item => item.Genres.slice(0,25)+"...", width: 48
          }
        ]
      }}

      cardsPerRow={[
        { cards: 1 },
        { minWidth: 550, cards: 4 }
      ]}
      items={props.items.slice(0,12)}
      loadingText="Loading resources"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box
            padding={{ bottom: "s" }}
            variant="p"
            color="inherit"
          >
            No resources to display.
          </Box>
          <Button>Create resource</Button>
        </Box>
      }
      header={<Header>{props.titulo}</Header>}
    />
  );
}