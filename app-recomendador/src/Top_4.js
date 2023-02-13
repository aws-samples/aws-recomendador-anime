import * as React from "react";
import "@cloudscape-design/global-styles/index.css";
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import Header from "@cloudscape-design/components/header";



export default (props) => {
  const [selectedItems, setSelectedItem] = React.useState([]);
  const [itemList, setList] = React.useState([]);

  const handle_ver_anime = (e) => {
    console.log("ver asnime:",e)

  }

  useEffect(() => {
    fetch(props.API)
      .then((response) => response.json())
      .then((data) => {
        setList(data.data.itemList);
        //setSelectedItem([data.data.itemList[0]])
        console.log(data.data.itemList)// 
      });
  }, []);

  return (

    <Cards

      onSelectionChange={({ detail }) => {
        console.log(detail.selectedItems)
      }
      }
      selectedItems={selectedItems}
      ariaLabels={{
        itemSelectionLabel: (e, t) => `select ${t.name}`,
        selectionGroupLabel: "Item selection"
      }}
      cardDefinition={{
        header: item => (
          <Link fontSize="heading-m">{item.name}</Link>
        ),
        sections: [
          /* {
            id: "MAL_ID",
            header: "Anime ID",
            content: item => item.MAL_ID
          }, */
          {
            id: "Name",
            header: "Nombre",
            content: item => item.Name, width: 48
          },
          {
            id: "sypnopsis",
            header: "Sypnopsis",
            content: item => item.sypnopsis.slice(0, 100) + "...", width: 48
          },
          {
            id: "Score",
            header: "Rating",
            content: item => item.Score, width: 48
          },
          {
            id: "Genres",
            header: "Genero",
            content: item => item.Genres.slice(0, 25) + "...", width: 48
          },
          {
            id: "personalizescore",
            header:  "" ,
            //content: item => item.personalizescore ? ("Recomendation Score:"+ parseInt(item.personalizescore * 100) + "%") : "", 
            content: item => item.personalizescore ? <div><strong>Recommendation<br/>Score: </strong> {parseInt(item.personalizescore * 100) }% </div>: null, 
            width: item => 48
          },
          {
            id: "ver",
            content: item => <Button><Link target={"_blank"} to= {"/"+item.MAL_ID}> Ver Anime</Link></Button>
            ,width: 48
          }
        ]
      }}

      cardsPerRow={[
        { cards: 1 },
        { minWidth: 700, cards: 4 }
      ]}
      items={itemList.slice(0, 4)}
/*       selectionType="single"
 */      trackBy="Name"
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