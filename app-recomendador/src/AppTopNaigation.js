import * as React from "react";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import Input from "@cloudscape-design/components/input";


export default (props) => {

  const [visible, setVisible] = React.useState(false);
  const [user_id, setUser_id] = React.useState((window.localStorage.getItem('user_id') == null ? 500000 :window.localStorage.getItem('user_id')));


  return (
    <div>
      <Modal
        onDismiss={() => setVisible(false)}
        visible={visible}
        closeAriaLabel="Close modal"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Input
                onChange={({ detail }) => setUser_id(detail.value)}
                value={user_id}
              />
              <Button onClick={()=>{setVisible(false)}} variant="link">Cancel</Button>
              <Button onClick={()=>{
                setVisible(false)
                console.log(user_id)
                props.set_user_id(user_id)
                
                }} variant="primary">Ok</Button>
            </SpaceBetween>
          </Box>
        }
        header="Sobreescribir User ID"
      >
        Problemos con un user ID mayor a 500000 para conocer la experiencia de nuevos usuarios
      </Modal>
      <TopNavigation
        identity={{
          href: "#",
          title: "Recomendador de anime",
          logo: {
            src:
              "./loguito.png",
            alt: "personalize"
          }
        }}
        utilities={[

          {
            type: "menu-dropdown",
            text: "Como crear esta aplicación",
            description: "eliaws@amazon.com",
            iconName: "user-profile",
            items: [
              { id: "blog1", text: "Recomendador de Anime: Machine Learning" },
              { id: "blog2", text: "Recomendador de Anime: Amazon Personalize" },
              { id: "blog3", text: "Security" },
              {
                id: "support-group",
                text: "Support",
                items: [
                  {
                    id: "documentation",
                    text: "Documentation",
                    href: "#",
                    external: true,
                    externalIconAriaLabel:
                      " (opens in new tab)"
                  },
                  { id: "support", text: "Support" },
                  {
                    id: "feedback",
                    text: "Feedback",
                    href: "#",
                    external: true,
                    externalIconAriaLabel:
                      " (opens in new tab)"
                  }
                ]
              },
              { id: "signout", text: "Sign out" }
            ]
          },
          


        
          
          {
            type: "button",
            text: "Probar con otro User ID",
            onClick: (()=>{setVisible(true)})
          },
          {
            type: "button",
            text: "Amazon Personalize",
            href: "https://aws.amazon.com/es/personalize/",
            external: true,
            externalIconAriaLabel: " (opens in a new tab)"
          },
          
          

        ]}
        i18nStrings={{
          searchIconAriaLabel: "Search",
          searchDismissIconAriaLabel: "Close search",
          overflowMenuTriggerText: "More",
          overflowMenuTitleText: "All",
          overflowMenuBackIconAriaLabel: "Back",
          overflowMenuDismissIconAriaLabel: "Close menu"
        }}
      />
    </div>

  );
}