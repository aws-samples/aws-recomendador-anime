import * as React from "react";
import Button from "@cloudscape-design/components/button";

import Input from "@cloudscape-design/components/input";

import ColumnLayout from "@cloudscape-design/components/column-layout";

export default (props) => {
    const [inputValue, setInputValue] = React.useState("");
    const handleSubmit = () => {
        console.log(inputValue)
        props.buscar_animes(inputValue)
    }
  return (
        <div style={{padding: 20}}>
        <ColumnLayout columns={3}>
        <div></div>
        <Input
        value={inputValue}
        placeholder = "Ingresa un Anime para buscar"
        onChange={event =>
          setInputValue(event.detail.value)
        }
      />
      <Button onClick={handleSubmit} variant="primary">Submit</Button>
      
      </ColumnLayout>
      </div>
  );
}