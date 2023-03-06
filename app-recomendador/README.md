# Crea una aplicación web para probar las recomendaciones personalizadas de anime en tiempo real.

Blog original --> https://aws.amazon.com/es/blogs/aws-spanish/crea-una-aplicacion-web-para-probar-las-recomendaciones-personalizadas-de-anime-en-tiempo-real/

---
**Recomendaciones personalizadas de anime**, es una serie de episodios donde te guío en la construcción de una aplicación web capaz de entregar una experiencia personalizada de recomendaciones de animes, nuevos de la preferencia del usuario y, a medida que se utiliza con mayor frecuencia, puede ir entregando recomendaciones cada vez más relevantes.

Consiste en los siguientes episodios: 
•	[Cómo crear un modelo de recomendaciones personalizadas.](https://aws.amazon.com/es/blogs/aws-spanish/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning/)
•	[Cómo desplegar el modelo recomendador de anime en una API REST.](https://aws.amazon.com/es/blogs/aws-spanish/como-desplegar-el-modelo-recomendador-de-anime-en-una-api-rest/)
•	Crea una aplicación web para probar las recomendaciones personalizadas de anime en tiempo real. (este episodio).
•	Incorporar un pool de usuarios a una aplicación web.
•	Analizar el comportamiento de una aplicación web mediante un dashboard. 

En el [primer episodio](https://aws.amazon.com/es/blogs/aws-spanish/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning/) se entrenó un modelo de recomendaciones de anime utilizando [Amazon Personalize](https://aws.amazon.com/es/personalize/) empleando las [calificaciones de Anime](https://www.kaggle.com/datasets/hernan4444/anime-recommendation-database-2020). Este modelo se puede utilizar a través de la API de [Personalize Runtime](https://docs.aws.amazon.com/personalize/latest/dg/API_Operations_Amazon_Personalize_Runtime.html) utilizando un jupyter notebook. 

En el [segundo episodio](https://aws.amazon.com/es/blogs/aws-spanish/como-desplegar-el-modelo-recomendador-de-anime-en-una-api-rest/)  se hizo la integración de la API de Personalize a una API REST (Fig. 1) empleando [Amazon API Gateway](https://aws.amazon.com/es/api-gateway/) para invocar funciones de [AWS Lambda](https://aws.amazon.com/es/lambda/),  y así consumirla de forma segura y escalable, esta API permite entregar  las recomendaciones de acuerdo a los gustos del usuario y/o anime consultado, agregar la metadata necesaria, filtrar los resultados por géneros y además alimentar el modelo recomendador con las nuevas interacciones de los usuarios empleando [Event Tracker de Amazon Personalize](https://docs.aws.amazon.com/personalize/latest/dg/API_EventTracker.html).
	  	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0sln5gnzwst6ix1tow2w.png)

Fig. 1 Diagrama de api-rest para un recomendador utilizando Amazon Personalize.	


En este episodio vas a desplegar una aplicación web que simulará la interfaz de una plataforma de video streaming de series y películas de Anime, donde el usuario podrá:

•	Realizar búsquedas de anime a través del nombre (1 en Fig. 1).
•	Recibir recomendaciones de animes personalizadas (2 en Fig. 1) de acuerdo con los filtros creados en el [primer episodio](https://aws.amazon.com/es/blogs/aws-spanish/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning/) (Shounen, Music, Drama, Sci-Fi y Action). 
•	Seleccionar un anime conduciéndolo a una nueva página, donde:
o	Recibirá la descripción del anime (3 en Fig. 1), 
o	Recibirá recomendaciones de anime similares (4 en Fig. 1) al que está mirando.
o	Podrá simular que lo visualizo y calificarlo (5 en Fig.1) 
o	Ingresada la calificación la aplicación entregará recomendaciones de acuerdo a esta preferencia, porque el modelo se estará retroalimentando con el perfil del usuario. 

En la creación de esta aplicación vas a desplegar el código fuente en el [repositorio de este proyecto](https://github.com/aws-samples/aws-recomendador-anime/tree/main/app-recomendador), creado con [react](https://reactjs.org/) y complementado con el sistema de diseño [CloudScape](https://cloudscape.design/). 

Para empezar (Fig. 2) 
-	Clonarás el repositorio del proyecto en un entono virtual de desarrollo de [AWS Cloud9 ](https://aws.amazon.com/es/cloud9/)
-	Acá es donde configurarás los endpoints las APIs REST creadas en el episodio anterior (tus APIs)
-	Probarás la aplicación web de forma local. 
-	Crearás un repositorio nuevo con los cambios en [AWS CodeCommit](https://aws.amazon.com/es/codecommit/) 
-	Finalmente, el despliegue de la aplicación web de recomendaciones de Anime lo harás empelando el servicio de [AWS Amplify](https://aws.amazon.com/es/amplify/).


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ldlvx9gttg52ye1cvwx3.png)

Fig. 2 Diagrama creación aplicación web recomendación de anime.	


Esto te permitirá emplear el método de una integración y despliegue continuo (en ingles continuous integration/ continuous deployment – CI/CD), los cambios que se realicen en el repositorio de CodeCommit automáticamente generaran un nuevo despliegue de la aplicación para integrar los nuevos cambios. 


**¡A construir! 🧰🚀**


## El proyecto 👷🏻: Crea una aplicación web para recomendaciones personalizadas de anime en tiempo real.

Pre-requisitos:
•	[Cuenta de AWS](https://aws.amazon.com/es/free/)
•	Conocimientos básicos en Python. 
•	Conocimientos básicos en JavaScript / react. 

**Manos a la obra 🚀 👩🏻‍🚀**

## Paso 1: Despliega la API REST del modelo recomendador de anime.

1.	Sigue los pasos del episodio [Cómo crear un modelo de recomendación personalizado](https://aws.amazon.com/es/blogs/aws-spanish/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning/) e ignora el paso final donde se borran los recursos. 
2.	Sigue los pasos del episodio [Cómo desplegar el modelo recomendador de anime en una API REST](https://aws.amazon.com/es/blogs/aws-spanish/como-desplegar-el-modelo-recomendador-de-anime-en-una-api-rest/) e ignora el paso final donde se borran los recursos. 


## Paso 2:  Crea y configura el entorno en AWS Cloud9.

1.	Para crear el entorno en AWS Cloud9 sigue [los pasos en este link](https://docs.aws.amazon.com/es_es/cloud9/latest/user-guide/tutorial-create-environment.html), y selecciona la región en la cual configuraste en los dos episodios anteriores. 
2.	Para la configuración debes clonar el [repositorio de esta serie de episodios](https://github.com/aws-samples/aws-recomendador-anime), selecciona Clone from Github en la pestaña de bienvenida de Cloud9 (Fig.3), y luego pega el link del repositorio [https://github.com/aws-samples/aws-recomendador-anime](https://github.com/aws-samples/aws-recomendador-anime) (Fig. 4).

	 	

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vcq923koajuw8bonb0rz.png)


Fig. 3 Seleccionar Clone from GitHub	


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2xu89ycn2x1sl01i7y73.png)

Fig. 4 Clona repositorio de Recomendaciones personalizadas de anime	


## Paso 3:  Configura las URL de la API REST para que sean invocadas por la aplicación web. 


Para eso modifica el valor de APIS del archivo en _**app-recomendador/src/apis_url.js**_ (Fig. 5) pegando los valores de Invocar URL  que obtuviste en el paso 10 del [episodio 2](https://aws.amazon.com/es/blogs/aws-spanish/como-desplegar-el-modelo-recomendador-de-anime-en-una-api-rest/#:~:text=Paso%2010%3A%20Probar%20la%20API.). 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b0d43r5vfv0e5e3lf8xu.png)

Fig. 5 Valores a modificar en archivo en app-recomendador/src/App.js	


## Paso 4: Corre la aplicación localmente en Cloud9. 

Lanza la aplicación [react](http://reactjs.org/) existente en el repositorio en el localhost de Cloud9, para eso: 

1.	Ve a la carpeta app-recomendador: 

```
cd aws-recomendador-anime/app-recomendador/
```

2.	Escribe en la terminal la siguiente secuencia de comandos: 

```
npm install
npm start
```

3.	Para visualizar la aplicación debes ir a **Preview** y seleccionar **Preview Running Application** (Fig. 6), esto debido a que estas dentro del ambiente virtual de Cloud9, pero si estuvieras trabajando en un ambiente local la aplicación se desplegaría de forma automática en el navegador. 


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w9khx6fvelatvsrnbl6h.png)


Fig. 6. Menú para ver una aplicación web en Amazon Cloud9.	

Copia la dirección de esa nueva ventana y pégala en el navegador (Fig. 7). 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4asy95tb4hs1p6cgwaz8.png)


Fig. 7. Aplicación web local en Amazon Cloud9.	


## Paso 5: Prueba localmente la aplicación Recomendador de anime. 

El paso anterior te muestra una aplicación web como en la Fig. 8. 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/53y87diiccwvn16cbwa0.png)


Fig. 8. Aplicación Recomendador de Anime.	

Las recomendaciones son personalizadas para el usuario que la utiliza, al ingresar a la aplicación web creada en este episodio lo haces con un usuario genérico 500000, [escrito en el código](https://github.com/aws-samples/aws-recomendador-anime/blob/main/app-recomendador/src/AppTopNavigation.js), por lo que todas las recomendaciones entregadas van a estar asociadas a ese usuario, lo puedes cambiar el menú Probar con otro User ID (Fig. 9). 

Si deseas generar un usuario para ti y empezar a recibir recomendaciones personalizadas debes ingresar un ID de usuario mayor a 320.000, correspondiente al ID de usuario de mayor valor en el [dataset](https://www.kaggle.com/datasets/hernan4444/anime-recommendation-database-2020) empleado para entrenar el modelo (un usuario que el modelo no conoce).

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/u16lo1x26u9jp5av5sf8.png)


Fig. 9. Cambiar ID de usuario.	


No se recomienda forzar el registro de usuarios en el código, esta es una excepción para probar la aplicación. Para crear una a[plicación web segura](https://maturitymodel.security.aws.dev/es/) en el próximo episodio se va a abordar como incorporar un pool de usuarios.

Tomando la consideración anterior, te explico como interactuar con las API REST creadas en el  [episodio anterior](https://aws.amazon.com/es/blogs/aws-spanish/como-desplegar-el-modelo-recomendador-de-anime-en-una-api-rest/) (Fig. 1) desde esta aplicación web. 

1.	**Información entregada por Anime**: Es información entregada a las API REST (Fig.1) por Personalize para cada Anime (Fig. 10), _[Recommendation Score](https://docs.amazonaws.cn/en_us/personalize/latest/dg/getting-recommendations.html)_ es la puntuación (0 a 100%) que genera Personalize a los elementos y se refiere a la certeza de que el usuario prefiere ese contenido. 
	 	

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/iw6zucne2m0ab1iyec5v.png)


Fig. 10 Información de Anime.	


2.	**Recomendaciones de anime por género**: en el inicio de la página verás 4 recomendaciones de anime personalizadas para el usuario separadas por género (Shounen, Drama, Music, Sci-Fi, Action), esto se logra consultando la API REST **_personalization_** (Fig. 1), por ejemplo, para Shounen (Fig.11): 

`https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/personalization/50000?filter=Shounen` 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fhatagb349pevvi3am15.png)


Fig. 11. Recomendaciones personalizadas de género Shounen.	


3.	**Búsqueda de anime por su nombre:** en el menú donde dice Ingresa Anime para buscar (Fig. 12), al ingresar el nombre de un anime va a invocar la API REST search (Fig. 1). 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ceu3nkpf08a3cm4y3bk1.png)

Fig. 12. Búsqueda de anime por su nombre.
	

	Por ejemplo, el resultado de ingresar naruto (Fig. 13): 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pqr525lmtj9or4ehowyq.png)


Fig. 13. Resultado de búsqueda de anime por su nombre.	




4.	Selecciona **Ver Anime**: automáticamente abre una nueva ventana que te mostrará: 
a.	Descripción del anime (Fig.14), entregada por la API REST get_anime (Fig. 1) 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g9dt28eunz2uqptija21.png)


Fig. 14. Descripción del anime seleccionado.	


b.	Animes Similares a ese anime seleccionado (Fig. 15), entregada por la API REST sims. (Fig. 1)

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4z6d04dqorvv2amkqltv.png)
Fig. 15. Animes Similares al anime seleccionado.	

c.	Recomendaciones personalizadas para ti, entregada por la API REST personalization sin el filtro del género.



5.	**Selecciona Calificar**. En una ventana (Fig. 16) podrás calificar el anime. Esto permite alimentar modelo de recomendaciones de anime con tu preferencia empleando la API REST _**tracker**_.


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f0af6ua4olpgnhvisbmu.png)

Fig. 16. Ventana calificar anime.	


6.	**Actualiza las recomendaciones:** cuando alimentas el modelo con tus preferencias automáticamente se va a actualizar para entregarte recomendaciones nuevas ajustadas a ellas, esto lo descubres actualizando el navegador. 


## Paso 6: Explora el código del front-end de la aplicación web.

La aplicación esta creada con [react](https://reactjs.org/) y el de diseño proviene de los componentes de  CloudScape (Fig. 17)

Si quieres crea una nueva aplicación debes seguir [los pasos para crear una aplicación con react](https://github.com/facebook/create-react-app) y los de [instalación de CloudScape](https://cloudscape.design/get-started/guides/introduction/), luego comienza a armarla importando y utilizando  los [componentes](https://cloudscape.design/components/overview/) de CloudScape listos. En la aplicación de Recomendador de Anime se utilizan los siguientes: 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zahtdq6lbfeoxpf5pydr.png)


Fig. 17. Diseño de la aplicación con CloudScape.	

-	Para crear la barra de navegación (1 en Fig. 17): [Top Navigation](https://cloudscape.design/components/top-navigation/?tabId=playground)
Compuesta por otros componentes:
o	[Button](https://cloudscape.design/components/button/?tabId=playground)
o	[Button dropdown](https://cloudscape.design/components/button-dropdown/?tabId=playground)
-	Para crear la búsqueda: [Input](https://cloudscape.design/components/input/?tabId=playground) con un [Button](https://cloudscape.design/components/button/?tabId=playground)
-	Para visualizar los animes en listado (3 en Fig. 17): [Cards](https://cloudscape.design/components/cards/?tabId=playground)
-	Para armar la estructura de la página (4 en Fig.17): [Grid](https://cloudscape.design/components/grid/?tabId=playground)


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ldjo09fk0blchd2dav6s.png)

Fig. 18. Diseño de la vista de animes en la aplicación con CloudScape.	

-	El botón de Calificar el anime en la Fig. 18 es un [Modal](https://cloudscape.design/components/modal/?tabId=playground).

En este punto la aplicación debe funcionar localmente y aprovecha de explorar el código en la carpeta src.


## Paso 7: Crea un repositorio en AWS CodeCommit en la consola.

1.	Ingresa a la [consola de AWS CodeCommit](https://console.aws.amazon.com/codesuite/codecommit/home).
2.	Selecciona la región donde configuraste los episodios anteriores. 
3.	En **Repositorios** selecciona **Crear el repositorio**.
4.	En **Nombre del repositorio** escribe **recomendador-anime** y selecciona **Crear**.

## Paso 8: Actualiza el repositorio de CodeCommit con tu código. 

1.	En Cloud9 abre una nueva terminal desde el menú de **Window** y luego **New Terminal** (Fig. 19). 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1xrxe8e39kwvcxyxurzo.png)


Fig. 19. Nueva terminal en Cloud9.	


2.	Ve a la carpeta _**aws-recomendador-anime**_: 

`cd aws-recomendador-anime`

3.	Agrega un el repositorio _**recomendador-anime**_ como nuevo destino remoto: 

`git remote add origin_new codecommit://recomendador-anime`

4.	Sube todo _**aws-recomendador-anime**_ al nuevo repositorio (nuevo remoto del paso anterior) (Fig. 20): 

`git push -u origin_new main
`


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hxc8c81g1awisb6g1b6z.png)


Fig. 20 Repositorio recomendador-anime en la consola de CodeCommit.	



5.	Actualiza el nuevo repositorio con las URLs de las APIs que agregaste en el Paso 3:

`git add .
git commit -m "actualizando las apis"
git push origen_new main`

## Paso 8: 🥳🚀👩🏻‍🚀 Despliega el Recomendador de anime en una aplicación web:

1.	Ingresa a la consola de [AWS Amplify](https://console.aws.amazon.com/amplify)
2.	Selecciona la región donde configuraste los episodios anteriores. 
3.	Si es la primera vez que entras a la consola de Amplify, ve hasta el final y selecciona **Introducción** en **Amplify Hosting** (Fig. 21). Si no es la primera vez, ve a **Todas las aplicaciones**, selecciona **Nueva aplicación** y luego **Aloja la aplicación web**.


	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/nop1a3auoo3d66wy952h.png)


Fig. 21 Amplify Hosting por primera vez. 	


4.	En el menú a continuación selecciona **AWS CodeCommit** (Fig. 22)

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jq9f4eq2bdix621ybzoy.png)


Fig. 22 Menú creación de Amplify Hosting.	

5.	Selecciona el repositorio **recomendador-anime**, selecciona la casilla **¿Conectando un monorepo? Escoja una carpeta** y escribe el **app-recomendador**, carpeta donde se encuentra el código de la aplicación web (Fig. 23) y selecciona **Siguiente**. 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yxadx6aefab0e3zwmf63.png)


Fig. 23 Configuración de Agregar ramificación de repositorio en Amplify.	

6.	Amplify se basa en el lenguaje de programación de la aplicación para determinar el tipo de aplicación web y genera un archivo de configuración que contiene las instrucciones para empaquetar o compilar la aplicación, así como las instrucciones para desplegarlo y/o probarlo. Dicho archivo utilizado para crear el pipeline de CI/CD puede ser personalizado para funciones más avanzadas (Fig. 24). 
	 	

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8uzy6ujlsjummmbc3lbt.png)


	Fig. 24 Configuración de compilación en Amplify.	

7.	En Rol de IAM selecciona **Cree y utilice un nuevo role de servicio** y luego **Siguiente** (Fig. 25). 

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/rqf0qlc2hdy6ybw86rse.png)


	Fig. 25 Selección opción Cree y utilice un nuevo role de servicio.	


8.	Finaliza con **Guardar e implementar**.
9.	Ahora puedes ver el proceso de CI/CD de la aplicación web en la consola de Amplify, te invito a curiosear y observar cada paso a medida que avanza, cuando finalice tu aplicación estará lista en el link que se encontrara dentro del recuadro naranja (Fig. 26).

	 	
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/m6smp51gml9xtdv8naoh.png)


	Fig. 26 Implementación de aplicación web en Amplify.	

10.	Cuando ingreses al link podrás hacer todo lo que hiciste en el Paso 5, pero esta vez desde  cualquier parte del mundo.

## Paso 9: Opcional – Probar las maravillas de CI/CD.

1.	Ve a Cloud9.
2.	En _**aws-recomendador-anime/app-recomendador/src/AppTopNavigation.json**_ modifica el valor de la línea 47 R_**ecomendador de Anime**_, por el texto que desees. 
3.	Actualiza el repositorio de CodeCommit: 

```
git add .
git commit -m "probando la integracion continua"
git push origen_new main
```
4.	Ve a la [consola de AWS Amplify](https://console.aws.amazon.com/amplify), ingresa a tu aplicación y observa cómo se realiza un nuevo despliegue de tu aplicación, al finalizar recarga la página web y podrás ver el cambio. 

## Paso 10: Limpieza de recursos en la cuenta de AWS. 

Estos pasos son opcionales, si tu intención es continuar con la construcción de la aplicación web, puedes mantener los recursos ya que los vamos a utilizar en el próximo episodio de esta serie.

De lo contrario, sigue los siguientes pasos:

1.	**Borrar recursos en AWS Amplify**: En la [consola de Amplify](https://console.aws.amazon.com/amplify), ingresa a tu aplicación y en Acciones selecciona **Eliminar la aplicación**.
2.	**Borrar el repositorio en AWS CodeCommit**: En la [consola de CodeCommit](https://console.aws.amazon.com/codesuite/codecommit/home) ve Repositorios, selecciona el repositorio recomendador-anime y luego en **Eliminar el repositorio**.
3.	**Borrar el ambiente virtual de AWS Cloud9:** En la [consola de Cloud9](https://console.aws.amazon.com/cloud9/) ve a **Environments**, selecciona el ambiente y luego **Delete**.


## Conclusiones

Ahora ya tienes una aplicación web que te permite recibir una experiencia personalizada de recomendaciones de animes nuevos de la preferencia del usuario. Además, la aplicación está preparada para entrenarse con tus gustos calificando animes y así te entregue recomendaciones cada vez más relevantes.

En este episodio desbloqueaste nuevas habilidades: exploraste la posibilidad de crear aplicaciones web de forma modular utilizando los componentes listos para utilizar de CloudScape, aprendiste a trabajar en un ambiente virtual de AWS Cloud9, a crear un repositorio en AWS CodeCommit y a emplearlo en el despliegue de la aplicación en AWS Amplify aprovechando las ventajas del CI/CD. 

Pero este no es el final, aun te falta:
•	Incorporar un pool de usuarios a una aplicación web.
•	Analizar el comportamiento de una aplicación web mediante un dashboard. 
Te dejos estos recursos para que sigas aprendiendo de las herramientas utilizadas: 

-	[Implementar una aplicación web en AWS Amplify.](https://aws.amazon.com/es/getting-started/guides/deploy-webapp-amplify/)
-	[Configuración de dominios personalizados con AWS Amplify.](https://docs.aws.amazon.com/es_es/amplify/latest/userguide/custom-domains.html)
-	[Amplify Immersion Day Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/84db0afb-0279-4d29-ae26-1609043d5bfd/en-US)
-	[Crear una aplicación móvil en la nube](https://aws.amazon.com/es/developer/learning/lets-build-mobile/)
-	[WorkShop de Static Web](https://webapp.serverlessworkshops.io/setup/)
-	[Build a cloud experience with Cloudscape Design System 🚀](https://catalog.us-east-1.prod.workshops.aws/workshops/5b7fe737-7ea2-4c4d-b572-76df6adabd47/en-US)
-	[Build on AWS Weekly - S1 E2 - Breaking Blocks with Terraform](https://dev.to/aws/build-on-aws-weekly-s1-e2-breaking-blocks-with-terraform-4dlb)
-	[WorkShops de AWS CodeCommit](https://awsworkshop.io/tags/codecommit/)


___
___

##¡Gracias!