import * as React from "react";
import "@cloudscape-design/global-styles/index.css";
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";

import Header from "@cloudscape-design/components/header";
import {Link} from "react-router-dom"


export default () => {
  return (
    <Cards
      ariaLabels={{
        itemSelectionLabel: (e, t) => `select ${t.name}`,
        selectionGroupLabel: "Item selection"
      }}
      cardDefinition={{
        header: item => (
          <Link fontSize="heading-m">{item.name}</Link>
        ),
        sections: [
          {
            id: "description",
            header: "Description",
            content: item => item.description
          },
          {
            id: "type",
            header: "Type",
            content: item => item.type
          },
          {
            id: "size",
            header: "Size",
            content: item => item.size
          }
        ]
      }}
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 500, cards: 2 },
        { minWidth: 700, cards: 3 },
        { minWidth: 1000, cards: 4 }
      ]}
      items={[
        {
          name: "Item 1",
          alt: "First",
          description: "This is the first item",
          type: "1A",
          size: "Small"
        },
        {
          name: "Item 2",
          alt: "Second",
          description: "This is the second item",
          type: "1B",
          size: "Large"
        },
        {
          name: "Item 3",
          alt: "Third",
          description: "This is the third item",
          type: "1A",
          size: "Large"
        },
        {
          name: "Item 4",
          alt: "Fourth",
          description: "This is the fourth item",
          type: "2A",
          size: "Small"
        },
        {
          name: "Item 5",
          alt: "Fifth",
          description: "This is the fifth item",
          type: "2A",
          size: "Large"
        },
        {
          name: "Item 6",
          alt: "Sixth",
          description: "This is the sixth item",
          type: "1A",
          size: "Small"
        }
      ]}
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
      header={<Header>Example Cards</Header>}
    />
  );
}