# Cómo desplegar el modelo recomendador de anime en una API REST.

Blog original --> [Cómo desplegar el modelo recomendador de anime en una API REST.](https://aws.amazon.com/es/blogs/aws-spanish/como-desplegar-el-modelo-recomendador-de-anime-en-una-api-rest/)

**Recomendaciones personalizadas de anime**, es una serie donde construimos una aplicación web capaz de entregar una experiencia personalizada de recomendaciones de animes nuevos de acuerdo a la preferencia del usuario y a medida que se utiliza con mayor frecuencia, puede ir entregando recomendaciones cada vez más relevantes.

Esta serie consistirá en los siguientes episodios: 

- [Cómo crear un modelo de recomendaciones personalizadas](https://dev.to/aws/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning-37mj).
- Cómo desplegar el modelo recomendador de anime en una API REST (este episodio). 
- Cómo crear una aplicación web para recomendaciones personalizadas de anime en tiempo real.
- Incorporar un pool de usuarios a tu aplicación web para recomendaciones personalizadas.
- Analiza el comportamiento de tu aplicación web para recomendaciones personalizadas en tiempo real con un dashboard. 

En el primer episodio creamos un modelo de recomendaciones de anime utilizando la data histórica del de Anime Recommendation Database 2020 de kaggle. Utilizamos el servicio de Amazon Personalize para entrenar el modelo y hacerle inferencia a través de una API utilizando un jupyter notebook, obteniendo recomendaciones de acuerdo a los gustos del usuario y/o anime consultado, filtrar los resultados por géneros y, además podemos alimentar el modelo recomendador con nuevas interacciones de los usuarios. 


En este segundo episodio, crearemos una API REST (Fig. 1) para consumir de forma segura y escalable la API de Amazon Personalize creada en el episodio anterior. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7grp3ihyyuvgvcscrucj.png) Fig. 1 Diagrama de api-rest para un recomendador utilizando Amazon Personalize.


Emplearemos el servicio Amazon API Gateway para invocar funciones de AWS Lambda con el código para consultar la API de Amazon Personalize para cada tipo de inferencia (Event Tracker, anime-sims, anime-rerank y user-personalization), la respuesta recibida la complementaremos con información adicional de los animes que almacenaremos en Amazon DynamoDB y obtendremos como resultado un JSON con la información completa de los animes recomendados. 

---

## El proyecto 👷🏻: Cómo desplegar el modelo recomendador de anime en una API REST. 


**Pre-requisitos:**

- [Cuenta de AWS](https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fportal.aws.amazon.com%2Fbilling%2Fsignup%2Fresume&client_id=signup)

- Conocimientos básicos en Python. 



### Manos a la obra 🚀 👩🏻‍🚀

### Paso 1: Crearemos el modelo de recomendación personalizado.

Sigue los pasos del episodio [Cómo crear un modelo de recomendación personalizado](https://aws.amazon.com/es/blogs/aws-spanish/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning/) e ignora el paso 12 donde se borran los recursos. 

### Paso 2: Crearemos el archivo de datos para la tabla.


El modelo de recomendaciones esta entrenado con los IDs del anime, nombrado como ITEM_ID, por lo cual, las consultas y respuestas al modelo están relacionadas al ITEM_ID.

Para la futura aplicación web necesitamos que la API REST entregue el ID del anime (ITEM_ID), el nombre del anime y su información general. 

Para esto poblaremos una tabla de DynamoDB con el contenido del archivo anime_with_synopsis.csv de [Anime Recommendation Database 2020](https://www.kaggle.com/datasets/hernan4444/anime-recommendation-database-2020) de kaggle descargado en el paso anterior.


La tabla tendrá dos usos: 

1. Retornar **Nombre del Anime** cuando se consulte por **ITEM_ID**. 
2. Retornar un listado de **ITEM_ID** cuando se realice una búsqueda por **Nombre de Anime**, no necesariamente exacto.


Ahora, explorando el notebook [anime-table.ipynb](https://github.com/aws-samples/aws-recomendador-anime/blob/main/api-recomendador/anime-table.ipynb) de [Amazon SageMaker](https://aws.amazon.com/es/sagemaker/), creado en el Paso 1, vemos que el archivo anime_with_synopsis.csv costa de 5 columnas (Fig. 2):


- **MAL_ID:** ID del anime. 
- **Name:** Nombre del anime. 
- **Score:** Promedio de puntación obtenida por el anime. 
- **Genres:** Géneros del anime. 
- **Sypnosis:** Descripción del anime. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/rajelzck6otlmyj0n0mx.png)Fig.2 Muestra de anime_with_synopsis.csv


El primer uso de la tabla lo completamos con la data de anime_with_synopsis, para el segundo uso es necesario agregar una nueva columna Name_Lower con los valores de Name normalizados a minúsculas, las consultas no siempre se emplean utilizando mayúsculas y minúsculas en conjunto. 

```
anime_with_synopsis['Name_Lower'] = anime_with_synopsis['Name'].str.lower()
```

Continuando los pasos en [anime-table.ipynb](https://github.com/aws-samples/aws-recomendador-anime/blob/main/api-recomendador/anime-table.ipynb), se crea el archivo new_anime_with_synopsis.csv y se guarda en el bucket creado en el Paso 1.


**Tip** 😉: Puedes explorar los datos en S3 utilizando [Amazon S3 Select](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html?icmpid=docs_s3_hp_s3_select_page). 


**PD:** Tambien lo puedes desplegar utilizando CDK con los siguientes pasos: [Pasos](https://github.com/aws-samples/aws-recomendador-anime/blob/main/api-recomendador/CDK_steps.md)

### Paso 3: Crearemos tabla anime-table en Amazon DynamoDB. 

1. Accede a la consola de Amazon DynamoDB en la misma región donde creaste el proyecto del Paso 1. 
2. En la parte derecha del panel de Amazon DynamoDB, selecciona Importaciones de S3 y luego el botón Importación de S3. 
3. En opciones de importación

   a. En Explorar S3, elige el archivo que creamos anteriormente (Fig. 4).

   b. En Importar formato de archivo selecciona CSV. 

   c. Selecciona **Siguiente**.
	

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hxp89sy4l30y6rsticdr.png)Fig.4 Explorar S3 > Elige archivo new_anime_with_synopsis.csv.	

4. En Tabla destino: 

  a. En el campo **Nombre de la tabla**, introduce a**nime-table**.
  b. En el campo [Clave de partición (Primary key)](https://docs.aws.amazon.com/es_es/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html), escribe MAL_ID. El tipo de datos en **Cadena (String)**.

5. Selecciona **Importar**.

Las consultas de a las tablas de DynamoDB se hacen a través de la clave de partición (Primary key), en este caso MAL_ID. 

Ahora, necesitamos una segunda tabla para poder consultar a través de Name_Lower, para esto creamos un [Global Secundary Index (GSI)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html):

1. Accede a la tabla dando **click** sobre el nombre de la tabla. 
2. En el menú Índices, selecciona **Crear Índice** y luego:

  a. En el campo Clave de partición (Particion Key), escribe Name_Lower y tipo de datos en **Cadena (String)**.

  b. Al final en Proyecciones de atributos, selecciona **Only keys**. 

  c. Finaliza con **Crear Índice**.


### Paso 4: Crearemos los permisos para las Funciones Lambda.

Separando las funciones Lambda de la Arquitectura en la Fig. 5, debemos crear 6 Funciones Lambda, 4 con permisos para Personalize, con el código para consultar la API creada en el episodio anterior, y 5 con permiso de lectura a DynamoDB para complementar la información entregada por Personalize. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/rrremc4lnd046cwrps7z.png)	Fig. 5 Funciones Lambda de la Arquitectura.	


Para otorgar los permisos a las funciones Lambda se crean los [AWS Identity and Access Management Roles (IAM Roles)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) de ejecución [(rol de ejecución)](https://docs.aws.amazon.com/es_es/lambda/latest/dg/lambda-intro-execution-role.html) con políticas de acceso para cada servicio, especificado en la Tabla 1 y separado en 3 tipos. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6jbhyj4ghrfu9d0oqfnm.png) Tabla 1. Tipos de IAM Roles para Funciones Lambda.


Para la creación de cada política de IAM sigue los pasos en este link, en el paso 5 pega el **JSON** a continuación correspondiente a cada tipo de IAM Role, ingresando tu **región** e **ID de cuenta** donde corresponde y escribe el Nombre respectivo para cada una en el paso 8 del link. 


a. Política IAM Role verde - **Nombre**: politicaverde: 


```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": "personalize:PutEvents",
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}
```

b. Política IAM Role azul - **Nombre**: politicaazul:
 

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "dynamodb:GetItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:TU-REGION:TU-ID-CUENTA:table/anime_table",
                "arn:aws:dynamodb:TU-REGION:TU-ID-CUENTA:table/anime_table/index/"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "personalize:GetPersonalizedRanking",
                "personalize:GetRecommendations"
            ],
            "Resource": [
                "arn:aws:personalize:TU-REGION:TU-ID-CUENTA:campaign/*",
                "arn:aws:personalize:TU-REGION:TU-ID-CUENTA:filter/*"
            ],
            "Effect": "Allow"
        }
    ]
 }
```

c. Política IAM Role Rojo - **Nombre**: politicarojo: 


```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:TU-REGION:TU-ID-CUENTA:table/anime_table",
                "arn:aws:dynamodb:TU-REGION:TU-ID-CUENTA:table/anime_table/index/"
            ],
            "Effect": "Allow"
        }
        
    ]
}
```

Una vez, creadas las políticas procedemos a crear los IAM Roles: 

1. En la consola de [Amazon IAM](https://us-east-1.console.aws.amazon.com/iam/?region=us-east-1#) selecciona **Roles**.
2. Selecciona **Crear Roles**. 
3. En **Seleccionar entidad de confianza**:

  a. Tipo de entidad de confianza: **Servicio de AWS**. 
  b. Caso de uso: **Lambda**
  c. **Siguiente.**

4. En Agregar permisos, realiza lo siguiente para cada IAM Role:  

Por ejemplo, para el IAM Role verde:
i.	Buscar y seleccionar: AWSLambdaBasicExecutionRole
ii.	Quita el filtro. 
iii.	Buscar y seleccionar: **politicaverde**
iv.	Selecciona **Siguiente**.
v.	Nombre del rol: **role-verde**.
vi.	Selecciona **Crear rol**.

Al finalizar debes visualizar en la consola algo similar a la Fig. 6 para cada **IAM Role**. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vct3h4mdot2fb92fwect.png) Fig. 6 IAM Role creado con éxito.


### Paso 5: Creamos las variables de entorno para las Funciones Lambda. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y81i6xfwaw2davk40x3j.png) Tabla 2. Configuración Funciones Lambda.

Los valores para [variables de entorno](https://docs.aws.amazon.com/es_es/lambda/latest/dg/configuration-envvars.html) de acuerdo a la Tabla 2 son los siguientes: 

**TABLE_NAME:** anime-table.
 
**Región:** TU-REGIÓN, donde tienes creados los proyectos. Lo ves en la parte derecha de la consola, en mi caso es us-east-1. 

**INDEX_NAME:** El valor en menú Índices de la tabla creada en el Paso 2 (Fig. 7) igual a Name_Lower-index. 


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gtdbw175xhz235rzhjp3.png) Fig.7 Nombre de Índice secundario global.


**FILTERS:** Los filtros fueron creados en el Paso 1, y están accediendo a la [consola de Amazon Personalize](http://console.aws.amazon.com/personalize/home), en el menú selecciona **Manage dataset groups** e ingresa a tu dataset, luego selecciona **Filters**, y veremos lo siguiente (Fig. 8):


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1mxwmoapitx1esy3b39b.png) Fig.8 Filtros en Amazon Personalize.

Copia cada uno de los **Filter ARN** del recuadro naranja de la Fig. 8, luego completa la información en el nombre que corresponda a cada filtro en el siguiente JSON:  


```
[{"name": "Drama","Filter ARN"}, 
{"name": "Music", "Filter ARN"}, 
{"name": "Sci-Fi", "Filter ARN"}, 
{"name": "Shounen", "Filter ARN"}, 
{"name": "Fantasy", "Filter ARN"}, 
{"name": "Action", "Filter ARN"}, 
{"name": "Comedy", "Filter ARN"}, 
{"name": "Adventure", "Filter ARN"}, 
{"name": "Kids", "Filter ARN"}]
```

El JSON final corresponde al valor de la variable de entorno **FILTERS**. 

**CAMPAIGN_ARN:** siguiendo los mismos pasos que para obtener FILTERS, en el menú selecciona **Custom resources > Campaigns**, como en la Fig. 10, debe haber tres tipos de campañas, creadas en el Paso 1. 


![Fig.9 Campañas en Amazon Personalize](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8fuloysyokaii84z7cei.png) Fig.9 Campañas en Amazon Personalize.

Ingresa a cada campaña, copia y pega el valor de ARN, este será el CAMPAIGN_ARN. Por ejemplo, el CAMPAIGN_ARN para la Función Lambda con nombre lambda_sims corresponde al de la Fig. 10.


![Fig.10 Campaign ARN de campaña Sims en Amazon Personalize.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dbe1tlms7rs4ydtc1ich.png) Fig.10 Campaign ARN de campaña Sims en Amazon Personalize.



**TRACKING_ID:** al igual que para FILTERS y CAMPAIGN_ARN, en el menú de la [consola de Amazon Personalize](https://us-east-1.console.aws.amazon.com/personalize/home?region=us-east-1&skipRegion=true#) selecciona **Event trackers**, ingresa al creado en el Paso 1 y copia el **Tracking ID** (Fig.11), el valor correspondiente a esta variable de entorno.



![Fig.11 Tracking ID en Amazon Personalize.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dfdfhryslexvis1ld9w3.png) Fig.11 Tracking ID en Amazon Personalize.


### Paso 6: Creamos las Funciones Lambda. 

En la consola de AWS Lambda, en la misma región donde crearte el proyecto del Paso 1.

1.	Selecciona **Crear una función**, en esta página:

  a.	Selecciona Crear desde cero.
  b.	Nombre de la Función: El que corresponde en la tabla 
2, por ejemplo, lambda_tracker. 
  c.	Tiempo de ejecución: Python 3.8.
  d.	Cambiar el rol de ejecución predeterminado

    i.	Selecciona Uso de un rol existente. 
    ii.	En Role existente selecciona el rol que corresponde al color de la Función Lambda, por ejemplo, role-verde.
 
2.	Deberías ver algo como la Fig. 12 para cada Función Lambda: 



![Fig.12 Crear Función Lambda.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lufanbbhszhedwqabzqj.png) Fig.12 Crear Función Lambda.


4.	Selecciona Crear una función.

A continuación, agregamos el código fuente y las variables de entorno. 

Para agregar el [código fuente](https://github.com/aws-samples/aws-recomendador-anime/tree/main/api-recomendador/lambdas):
 
1.	En la [consola de Amazon Lambda](http://console.aws.amazon.com/lambda/home) selecciona el **Nombre de la función** a editar, por ejemplo, **lambda_tracker**. 
2.	En el menú de la Función Lambda selecciona Código fuente, sobre-escribe el código en el cuadrado naranja de la Fig. 13 y pega el que corresponda, por ejemplo,  para  **lambda_tracker** sería el [codigo-tracker](https://github.com/aws-samples/aws-recomendador-anime/blob/main/api-recomendador/lambdas/tracker/lambda_function.py).


![Fig.13 Código fuente de Función Lambda.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y17vwtlayadke1yts488.png) Fig.13 Código fuente de Función Lambda.

3.	Selecciona el botón **Deploy**.

Para agregar las variables de entorno: 
  a.	En el menú de la Función Lambda selecciona **Configuración**. 
  b.	Selecciona **Variables de entorno -> Editar**. 
  c.	Agrega las variables de entorno de la Tabla 2 para cada Función Lambda. Por ejemplo, para **lambda_tracker**:

    i.	Clave: REGION - Valor: TU-REGIÓN
    ii.	Clave: TRACKING_ID - Valor: Tracking ID en Amazon Personalize, obtenido en paso anterior. 

4.	Selecciona **Guardar**, deberías ver algo similar a la Fig. 14.


![Fig.14 Variables de entorno de Función Lambda lambda_tracker.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lsmbqgxtag8jnrks6akd.png) Fig.14 Variables de entorno de Función Lambda lambda_tracker.

Repite este paso para todas las Funciones Lambda de la Tabla 2. 

### Paso 7: Creamos una API REST en Amazon API Gateway.

1.	Ingresa a la [consola de API Gateway](https://console.aws.amazon.com/apigateway)
2.	Selecciona **Crear API**.
3.	En **API REST (publica)**, selecciona **Crear**.
4.	En protocolo selecciona **REST**, en **Crear API nueva** selecciona **API nueva** y en **Configuración** Nombra tu API, en nuestro caso como Recomendador-anime, por último, en **Tipo de enlace** selecciona **Optimizado para límites** (Fig. 15). 



![Fig. 15 Configuración API Gateway.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fcjfx7keyeerv3ki1saw.png) Fig. 15 Configuración API Gateway.


5.	Selecciona Crear API.

### Paso 8: Creamos los métodos en Amazon API Gateway.

Necesitamos crear seis APIs (Fig. 16), una para cada Función Lambda y que sea capaz de invocarlas de acuerdo a los métodos y recursos de la Tabla 3. 


![Fig.16 APIs a crear en Amazon API Gateway.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wkfl0hnqkc259115ge57.png) Fig.16 APIs a crear en Amazon API Gateway.


![Tabla 3. Descripción configuración APIs.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/k01fbszib53v1bix9oj4.png) Tabla 3. Descripción configuración APIs.


Las APIs con método GET te van a permitir invocar las funciones Lambdas para obtener información del modelo de recomendación y de la tabla anime_table de DynamoDB, y con el método POST vamos a poder alimentar el modelo de recomendaciones con nuevas interacciones de los usuarios. 

Primero creamos los recursos:

1.	Dentro de la API creada en el paso anterior, selecciona **Acciones** y luego **Crear recurso**. 

a.	En nuevo recurso secundario, pegamos el Nombre del recurso de la Tabla 3, por ejemplo, para tracker (Fig. 17):  


![Fig.17 Crear recurso tracker en Amazon API Gateway.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/coyiaqw5s5wxja3n7uw1.png) Fig.17 Crear recurso tracker en Amazon API Gateway.


b.	Selecciona **Crear Recurso**.

2.	Dentro de los recursos creados anteriormente, debemos crear un recurso nuevo anidado, que será un dato con el que se invocará la función Lambda. Este sub-recurso corresponde a los valores de la columna **Ruta Recurso**, por ejemplo, para tracker (Fig. 18). 


![Fig.18 Crear recurso dentro de tracker en Amazon API Gateway.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/m3ys09uclebhqfe1p7ke.png) Fig.18 Crear recurso dentro de tracker en Amazon API Gateway.


3.	Repetir lo anterior para cada recurso de la Tabla 3.
4.	Hasta el momento deberíamos estar viendo lo de la Fig. 19.


![Fig. 19 Recursos de API Recomendador-anime(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/olgku0va2jskaezoo2bc.png) Fig. 19 Recursos de API Recomendador-anime


Para crear el método:

1.	Selecciona el recurso al cual vamos a agregar el método, por ejemplo, para rerank seria {userId}. Luego ingresamos a **Acciones > Crear método** (Fig. 20).


![Fig. 20 API Acciones > Crear método.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/htpa74quhhkci7tbb2gb.png) Fig. 20 API Acciones > Crear método.


2.	En el nuevo menú (Fig. 21) selecciona **GET** o **POST**, de acuerdo a la Tabla 3, y luego selecciona el símbolo ✅ para aceptar. 



![Fig. 21 Crear método.(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/io90dt01n9bhjgx7svxx.png) Fig. 21 Crear método.

3.	Selecciona el método creado e iniciamos su configuración: 

a.	En **Tipo de integración**, seleccionamos [Función Lambda](https://docs.aws.amazon.com/es_es/apigateway/latest/developerguide/set-up-lambda-integrations.html). 
b.	Marca la opción **Usar la** [integración de proxy Lambda](https://docs.aws.amazon.com/es_es/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html), que permite invocar una función Lambda en el backend.
c.	En **Región Lambda**, selecciona la región donde creaste las funciones. 
d.	En Función Lambda pon el nombre de la función, por ejemplo, **lambda_tracker**. 
e.	Dejamos lo demás tal cual. 
f.	Selecciona **Guardar**.
g.	Aparecerá una ventana “Agregar permiso a la función Lambda”, selecciona **Aceptar**. Esto otorgará los permisos necesarios para que Amazon API Gateway pueda invocar a la función Lambda. 

4.	De igual forma, debemos agregar el método **OPTIONS**, el cual configuramos con el **Tipo de integración** Simulación (Mock).
5.	Repetir lo anterior para cada recurso de la Tabla 3.
6.	Deberíamos ver lo de la Fig. 22.


![Fig. 22 Recursos con métodos de API Recomendador-anime(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/diwzkqonl6vwd3jwyymk.png) Fig. 22 Recursos con métodos de API Recomendador-anime


### Paso 9: [Publicamos la API](https://docs.aws.amazon.com/es_es/apigateway/latest/developerguide/rest-api-publish.html) para que sea invocada desde una URL. 

1.	Sobre la raíz de la **API /**. 
2.	Selecciona **Acciones > Implementar la API**. 

a.	En **Etapa de implementación** selecciona **[Nueva etapa]**.
b.	**Nombre de la fase** escribe prod. 
c.	Selecciona Implementación. 

3.	Cuando finalice, selecciona **Etapas**. 
4.	Despliega el contenido de **prod**.
5.	Seleccionando cada método **GET/POST**, vas a ver el link con el cual invocar la API: **Invocar URL**.

### Paso 10: Probamos la API.

Ahora, solo nos queda jugar con la API en cualquier navegador, para eso debes tener el valor de **Invocar URL** para cada método obtenido en el paso anterior (Fig. 23). 


![Fig. 23 API Recomendador-anime - Invocar URL(https://dev-to-uploads.s3.amazonaws.com/uploads/articles/sm76dhi1svj5us8dgdkt.png) Fig. 23 API Recomendador-anime - Invocar URL

**Tracker:** 

Para actualizar las preferencias por usuario. 

```
POST https://<event-tracker-api>/{userId}
body 
{
    "itemId": (ITEM_ID con que se interactúa),
    "eventType": (tipo de evento, ej: click, compra, view),
    "eventValue": (valor del evento, de existir por ejemplo calificación),
    "sessionId": (identificador de la sesión)
}
```

sessionId: puedes generar un numero random, [acá](https://github.com/aws-samples/aws-recomendador-anime/blob/main/recomendador-de-anime/05_Probando_Recomendaciones.ipynb) te muestro como. En producción corresponde a la sesión de usuario.

Ejemplo: Usuario userId = 20000 califica con nota = 9 una serie itemId = 199.

Request: 

```
POST https://API-ID.execute-api.TU-REGION.amazonaws.com/20000
body : 
{
    "itemId": "199",
    "eventType": "RATING",
    "eventValue": 9,
    "sessionId": "96e5a75b-8c71-42ea-a0ad-d9c474c44422"
}
```

Respuesta:

```
{
    "data": {
        "ResponseMetadata": {
            "RequestId": "96e5a75b-8c71-42ea-a0ad-d9c474c44422",
            "HTTPStatusCode": 200,
            "HTTPHeaders": {
                ...
            },
            "RetryAttempts": 0
        }
    }
}
```

**Consultas GET: **

En la Tabla 4 puedes ver como utilizarlas. 


|Nombre|	Invocar URL |	Request |	Request con filtro |	Resultado |
|  :---: |  :---: |  :---: |  :---: |  :---: |
|sims	| https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/sims/{itemId} |	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/sims/1000 | 	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/sims/1000?filter=Shounen	| entrega un listado de 25 elementos similares al consultado |
| rerank	| https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/-rerank/{userId} |	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/-rerank/300?inputList=3000,3001,2500 |	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/-rerank/300?inputList=3000,3001,2500&filter=Drama&numResults=10 |	Reordena items para usuario según orden de recomendación. |
| personalization	| https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/personalization/{userId} |	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/personalization/300 |	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/personalization/300?filter=Shounen |	Recomienda 25 items del filtro para el usuario = userId |
| get_anime	| https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/get_anime/{MAL_ID}| 	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/get_anime/1000 | | 		Entrega la información del anime MAL_ID consultado. | 
| search	| https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/search/search |	https://API-ID.execute-api.TU-REGION.amazonaws.com/prod/search/search?nombre=narut |		| Entrega un listado de la data de animes que contengan la palabra buscada en su nombre.| 


### Paso 11: Borramos los recursos de la cuenta de AWS. 

Estos pasos son opcionales, si tu intención es continuar con la construcción de la aplicación web, puedes mantener los recursos ya que los vamos a utilizar en el próximo episodio de esta serie.

De lo contrario, sigue los siguientes pasos:

1.	**Borrar recursos en API Gateway:** En la [consola de API Gateway](https://console.aws.amazon.com/apigateway), selecciona la API y en Acciones seleccionar **Delete**.
2.	**Borrar funciones Lambda:** En la [consola de AWS Lambda](https://console.aws.amazon.com/lambda/), selecciona las funciones Lambda a borrar y en **Acciones** selecciona **Eliminar**. 
3.	**Borrar Tabla de DynamoDB:** En la [consola de Amazon DynamoDB](https://console.aws.amazon.com/dynamodb/) selecciona Tabla a borrar y luego selecciona **Eliminar**. 
4.	**Borrar AWS IAM Role:** en la consola de AWS IAM en el menú de la izquierda selecciona Roles, y pega en el buscador el nombre del role que copiaste en el paso anterior, presiona la tecla **Enter**, selecciónalo y luego **Eliminar**.

---


## Conclusiones: 

En este nuevo episodio desbloqueaste una nueva habilidad: Creación de API REST para consultar de forma segura y escalable el recomendador de anime creado en el [episodio anterior](https://aws.amazon.com/es/blogs/aws-spanish/como-crear-un-modelo-de-recomendacion-basado-en-machine-learning/). 

Empleamos el servicio **Amazon API Gateway** para crear recursos y métodos que invocan las funciones de **AWS Lambda** con el código para consultar a ** Amazon Personalize**, y las respuesta recibidas las complementamos con la información general de los animes que almacenamos en **Amazon DynamoDB**, como resultado obtuvimos un JSON con la información completa de los animes recomendados. 

Además, creamos una API método POST al Event Tracker, que te permitirá alimentar al modelo de recomendaciones con nuevas interacciones a animes, y así entrenarlo para que entregue recomendaciones personalizadas al usuario que lo utilice. 

Te invito a continuar experimentando con estos servicios y seguir creando aplicaciones para que sigas desbloqueando nuevas habilidades. En [Amazon API Gateway tutorials and workshops](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-tutorials.html) puedes conseguir nuevos proyectos. 

Pronto una nueva entrega de Recomendaciones personalizadas de Anime para que terminemos nuestra aplicación web de recomendaciones de anime.  

___
___

##¡Gracias!
