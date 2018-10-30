# emc-streamer

Backend for EMC Project (E-Media Center)
- Retrieves url(s) of media file from Youtube, Vimeo, DailyMotion
- Stream local videos files


Installation :

- Git clone
- npm install
- node server.js (multi process) or node app.js

connect to : http://localhost:3000/demo

enjoy ;-)


API:

type : [yt => YouTube, dlm => DailyMotion ,vimeo => Vimeo]

{type]}/stream/:idVideo :        Stream the video
{type}/play/:idVideo    :        Play the video   /* Stream and play are the same action */

{type}/download/:idVideo :       Download video file
{type}/info/:idVideo :           Get name and title
{type}/geturl/:idVideo :         Get secret-url for stream or download
{type}/yt/getoembed/:idVideo :   Wrapper for Oembed call
{type}/getembed/:idVideo :       Get the HTML for embed video
