
import * as THREE from './three.module.js';
import {ARButton} from "./ARButton.js";

var container;
var camera, scene, renderer;
var controller;

var reticle;

var hitTestSource = null;
var hitTestSourceRequested = false;

init();
animate();


function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );

    var light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    light.position.set( 0.5, 1, 0.25 );
    scene.add( light );

    //

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    //

    document.body.appendChild( ARButton.createButton( renderer, { requiredFeatures: [ 'hit-test' ] } ) );

    var geometry = new THREE.BoxGeometry( 0.2, 1, 1 );


    function onSelect() {

        if ( reticle.visible ) {


            var texture = new THREE.TextureLoader().load( 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGBsYGBgYFh0aGxsYGhgfGBgbGxoYHSggGB0lGxgaITEhJSkrLi4uGh8zODMtNygtLisBCgoKDg0OGxAQGy8lHyUwLS0tLS0tLi0tLS0tLy0tLy0tNS0tLi0tLS0tLS4tLS0tLS0tLS0tLS8tLS0tLS8tLf/AABEIAOEA4AMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAECBQAGB//EADsQAAECBAQDBgQEBgIDAQAAAAECEQADITEEEkFRYXHwBSKBkaGxEzLB0QZC4fEjM1JicrIUgmNzwjT/xAAZAQADAQEBAAAAAAAAAAAAAAABAgMABAX/xAAzEQACAgAEAwYGAgICAwAAAAAAAQIRAxIhMUFR8AQyYXGBsRMikaHB4TPxwtFSchRCYv/aAAwDAQACEQMRAD8AXkzYieXcgNzr+m/nHYMV4Rykd6tBV2DmnDePFaR22KKVTjwgR9IZxCAz0D6DlaE1p8IdAHpZPGCrmsOXnAJYpenPp7RM27DaA0YFNUHiqFEhm8oidL4vB8LKsTbb194GlGFZl9zoNf1g0nATDVwnXf0jTRhgC+vVBFpisiXYqOwFfpEXiNuojqPMURhKXctBJcgWZ+FT5w7Kwu58vvDaZIDAUh44Dl3mBzS2E5eABd0pA1cCMLtXtaRLZMsJK6XSwYx6XteUfgqSm5SQPGn1j5xPUpalkWJruS92PhSOqHZociE8WSDzPxLNdmlX/o+pMRJ/Ecx++lKkvYAg+DGMacKn2iBWLf8Aj4dbA+JI9zg8s5OaWqouk3B2gc6WXq4bSMbsSeqXMzqN7ubjXxsY9dMSmcl0kHY8RpHDiweFLw5l4SzrxPNKKs3B45SyH8oZxKG+ahFIXKCWrr7WiiVgIzG7mCSyYlUo0Bp1yiUNAVGIVMVEJd7eD/rFkIrekcrrT2g0gEyXdoblJZyOV/rCUlwaBuPhByum0CSthTJQou76+sMBQY+MAlAPv194vNSbNfYecCSVmTNTBip2Nd/r+sXmpqT14xTCj3g86rhvvfWFnuZCGIIbjCvwjtGjMlufKBzg1HgpmZ0hLAU9LQPFqJLt6MIalinhFJsv9oLowiUkh4c7MkigNnfyrAkaiHOzEnNW1GGtQ19nrEpv5RluFx2JQhUsH5lqCEjXieA+4h7ssBbkhmUpLP8A0kgGEe1+yjMXJWlgZa8xfUFiba90RMvtVGHClTHYKd2JqtyBTkYWEVpW/H6mkzQWwUaWMcuZUXI4Drox5ib+M5JUWQsudgBfiXbwjX7FmFfxUlRJTNWh33ZSfILHlHUpTh3kTdPYdmAm/wC0eB7XkKlKUMoqSUkAMQfVxUx7JOJWU3c6U1jJwON/5GG+JMQknOQwcAAMXcmmkUwpZpteNCzSS1PHKkZl0DO+r11cx2HwhMz4Yu7UrHq5v4bT8QghRKqhLMQ9XOntG1huwEopSWWfuOFEDdV9Y6MwiiecwnYrZU1K2JIsBQkAvrTq8OYCcQMxZJAsbGrU2pHppXZSEuEpFQakVzHUmM78UyEgoZgS78oni1KOXcph1mM3tGUmaBMTXQ8CIyFEika+GCQMtQVAu9iRUNxYesZmIRWnXGOfLleXhwHZ3xe63D6R0lMWAAZxzpxg8lANYW6MDmSSK9fpAiLw/wDD4n9B9IXUisZSM0Ulo4fWDfDcVBA5RaQmCLPdgN6mBszcouo04RVKmFfaLhJyvDtAs0ZQZZSqjON6jxhhTOa8LQhJ/mV6ENLUHIB8fWJyQUWmoYX5ecAxCNTyf1v4wZdg5aBLUcrcoVBZ0sAJgiUOOLxaWARZ7+PPrSKEhuurQd0AEhN6ROBWczakhvMCBS5juOPVobwMj+IgtrTwqfrCuOgUx6Z2mgJ+JUpziXaoJmCT5BRrwjE/FmDUZE5RAZ0KoXNGSdOPvGjO7FmzJM9CWSTOzoUo0bOmY9HIq4tpF+0lifhp5SG7s1LEVzS3f1TFIqEJRkuO/uhXbTTPlChH0/scOn4qSxmFMw7E/DAF+AEfMI+m/hZWbCySP6Sk80qIHmAI6O2d1Prn+BMPcNiU5Eoy3VMyvdnSpbjxSB4mA4fs+WhKZaEUmKsXLFQGZVVWDM32h7GSiRLYfLOSo8EsoE8qxpS5aU1VfTesSwZuM1Jeb+j/ANjTVpoQkSAlSSl+67XLhmr4M20N/wDJBJKk1Ay+B5xE1DacGb0A1hrDYRIDkBzHS7erEVLYBOmWP5W03JDR5/tYKmLC1A5QEgtyqeTvHocZhgRTSwenGM2fhytJDkOL7cfMV84Wxo8zJ+DlzBQ+TMoE3DpYcncRlzEg12jYnyCiXlNFKNTwTbzJfwjMWjV+miEpXJ62PwFlhwILhS0XSikWlSacdujAbWwEi61B7P6QBRc0gy0Va/PqsElJBBbaFtIIOWvhvy3gpHAQNN/1hpCHjS0MhZSb9cousd3hBkgixB8R5RfFkkM2kFSAyEVUL0hmZKAN+ntxo0LoqYfmodi9/pboQZaGRWaC1KigD8tnNoXJpTi/08bw6Je71LO/m+5gUxWvXhrE4hYDD1ppy2imIVp11aCSld7wis0DX9oYwrKd+t41JeJTK/iKBIBYszjOQh6tQFYhFIqw6EPf8EzpM2WKFSKE6EFJBpW4gNpasxpYvtYSPhoKSfir+GC4ABFawnmEoqAqmbNKjwMwBJA8fcx3bXZ8yeZGVnlzpcxTlu6B3m42iuNRmISSArMjKz5XRMC0vRwSE8qxDDSajr4P6jPiIo/A2GSEqKpi8wdioCv/AFAPrD+AkIlyVS0pASCQ13dnvWLYrt0CTNKEEnD5wQos+VlFiHoyvSE+y+1hNw6Zik5SteVhViZmQCu5KfOKN4k3cnp+aAsq2H8UUSsOqYTkSlyWFAAM6iw8fOIRIyFSs3zLzEGv5WYHQOx11GtDpcoKVJCkljlNaEsXYHTQPCuOEzKD3UJLZbnu5ASCN8zgFrAOIzjGb+X1DBNuhtE86F3FLMCLVFf2hmXjXFRo9OceeXNBTdQYBg5Dl71Ki3IDQtGpLBCEkku1fKl2rFc0ktGHEwVBsdViUlJu7bcKNCUlKlJBok0cKHuzNyhLH5/iJSQoJcBJBoSS9r0Y+EbSk0avOB2ibjhx/wDrX0/f6EhBXZg9vfM3D6nrwjAmFqR6rtqS+Uix7p9x9Y87iZTqYAiI4MvlQ0kL5uvSGpDBrwoZWV6+sMA1EVlqKjsSa24RyfkPOCLQ5trFZQBIB3+jRlsYFKYGG0qLHaBTkMYKhekM9dQHZQPeCKLjlF0JB3tSDTpXH0bYWgJ8DM5Es3aln3N/ZoIpbN1o0Uwya1ETifrDS5GQSZM53694iYQeutYHn296/veOmkNSESCBlq7w684ibMcmISXMcv5jGZiguI3+xiyVHh9/tGBlqI3OyZhAIZ3FTtVm8n8oXFpxMtw+ExBVMBB7qkpUzW1v4xTGYYqIUCzKCrf0lz6CIw2HKEoIclMoIya0b89BYbbw2JlbGla2L7RKWRJ1w2+wyviY2GwJz4lRIyTiCkA2Hw8q30BcnyEG7I7HlykiUHKMwPeL1cKdxxDwxgpzykpOYqDglnJIUU6VJ7rwQTdq/QkPXwIPiISbmm11poFVQZcogljlAc8wxDHgHB8IYxUkLlAcuqQNCwUFyAouOJpBsD8oSdKeUdPZtNHyJzb3QtP7LlZQKpAGh04vC6JQAIAIBckA+XEWie3cblZILPq9k7+cZqXpUpzWOYlKW/MVLUCH5HxjrfZ86tOgfEk/l3/e47iMGj4iFH+IpwxH5auCXNgTpWG0TklwkuYyuyce6gkvV8qixe77H8puBaNTByUhyPvHB2lU6nei0LRsjE4QmWUi4r4316rHmsUkX10/ePW5y8ea7Xw5StV8pqK+PvSIYL1oMjKShgXqdPrF0ncPTeLKBKTX0u3tSOMk9bR1EyCsn01gYoXaCLBiUooKh7kbcPR4daIVkZnNoLl2jssQ1QdIZGGpN+toviJl2gQJi2JT3Xs49LQtKzBZKGNz1zi05Jpz6NOMFlG0BxyiBd2oK8faptDasAFRFft9Y7QtrC+YkcovKIZ41UEtJTXlE4l833iZCgDyghTWsKzAChqxs9iq7pPL6wguWOP2jQ7DmBIU/DR7X5fMIlifNGkPHRmhbx4RIb7wvjZhVIzyC5UhSkEB3dLoIB5jSFpqlpQg5wVTEMO6+WYEZjmSCDRjR/KILAlV6DZ1ZoyABMSsXD+IYj6xnok/xFgpOXuGhYnRTFx+VI1icfjjJRKKk5sykoLd1isGtXpS3rHdl4r4/wAQJGXIpSC5vlAOlrw0XOMbrT9oDSbEFdnlWIlYlJYIEwZVVUUrfICXNn3OkNdizykzDTKSCBcBwSbWNaxqKkEXIPp5xlYDELynPLKSFKSL1SNbbn6x04OLJ4c5Lw92/USSSaQDtlKSrMquZNOLggANXU0FwqFJuHzJBY0IrVVagtlcqcgqc8I2kpdLM2la+94HLAF9afJVyXFRo37x0Yfa8qprUEYuOwj2ZhQlYYMBmqQzVIZ+TFvO0bkhAAp1vCEj5a7sbtxIFSBGhJlgp5j0tHn9rxfiTzcCmGqRZCKvWt3NPW0Z3baApBLWLefvpDyxQJBaIxsrMhQ4V8IjF07GZ49EwbDbjF0LardfvApkjvHLoeqxKEluLx2UiZCx6wTCqyqc7Ea/Tz8IhF67QQEPZjuLw7AUmrD70jnAFYqpIeCBVBDrQDDSBWC4kk0SOm+8Ck6tpBmp4QqWtmG0yqAj24UhXEpLcKjxjQSjug8ISnkQYsDFSnSBBTQ24gBS/jDJmAyXBPQ9LxoDhahiEyhl46U0b3eCSmy3qKt6wktQooT16w92Sk5lAMaNtTMk/wDzCqkDy66aGOzkLzpyNUjO/wDRq3F29Ym7rQY0ez5Pw5MtJZQlS0pJs+Vg4GlrQtKQ60KSQQJ6lLZQJQFSVfNsXUin9wjLw3bkz/mKw5y/CIOgzN8POO9mbxtHo5GBTKzZXdas5ffIlFNgyR4vEpReFrLdr3CmpaIyPxQxlIfTESvLN+sD7DVkOKCSxE4cfmlpeN9gBQVhDESs8xITUoqr/sO7zhIYuaLg/r19PULjTsW7SxkzIAhTqUF0ABIWHCaAOPywt2tMIUEoSxWCXcCosCT/AGvqDsY1ko3u3sR9R6wCdLTOSX+U0NA7g8aG1o6+z48IThJx0V/39ic4tppMxsHiCtQDmWCAyc2YGveYkhgQwAqLtGvISRR1UPobC1oXV2akFIqrKlnJp8zgEAb1psBYRoiQS5FT0b6RbteNh4zTw117/UTDg43YNEnu21JHIm9bQZAI6rBEOEszZbjam5vFUIGYqu9euEeRLd3odS2LIllyX0iJ0x8w5j6Qd6WjpaARa9HgRkt2jNcjxE1wsiLIILuGi+PQyzetYDKPlHdurJFFIoYsDdrxZLU9m+3vBktY+0VsWikwMWPpFFJej+8FyO9IlvONFmYxhgQQRQtcUuK/aLTgCKdUpESpRYQKcq706tGi9TDXxDl8IRnTSTyh1cxxy4cKPCai5uw3IP0hloAsbRVBvrziuenXWsRKLwAjSlhuvPreIBZW3n+7RxDgCLz0BuPXXjC2EGvEVNdIf/D8z+Kf8T7iMckZoc7PlPNQDQKJFuB08oDjapGsYn/CRiVAqSJhnSykFXfKVShLLfmOsb6Z9cpoSS1dA42o7WhOVNTLlkrqU0JAc3y87iF58/IqWo2zJQGOq5hY10BXAeGmmpcNPWjXyNZSRWsLkhJzAOSwLcHI9zBFlgI4x5q0LGWrtWVmSJihKWW7iyM1VJUAwP8Aa0Ww4yApUksFUcioId30qSK7R5b8U4FSsRMmJP8AJlIWQ1+8vV6fLHsUJc75asdaUB0j1ngxhlv+t2c+ZuzkoJZQsYLKxJQWp1+8CRMU3foaUDD6mMzGdpNMIAScoq6mUde6Grs2pOl4lGE3itRHq0bC5uZ30Pp0IrILcb29PpGR2ZOniZNTNKbDKUgakgeg1jakzNNaV+sc3acN4eI4tp+Q+HK46HfEejXoeUHkgBJA4+tSfOEApYmm2Q2u4Ptd40JdvCIPQc8521I7xVvU/WMpBHKvvaPRdtJaWXq1/H9fePLlfXjHZhO0SZdSg8ECq9bQtrXpoukx0VoIOyljXnEkisDky6bQRaRm7rto5fqsBUYYw9QNYDjiK+UGwiqN6ev2geM1f0fq0LHvGewSbUtx6NIVUsCkM4oNTp6wqEGhI48x+8V8wEzFewgWHN46bE4erv00atDWNS1BoKS4bWISkACJlEV+3nE2MKKl14w0iY0yW2ik8nf9YGiqr2gc9bFKj+VST5F/pGZhjsrtVWIkutKQqZO+GAl8oUhJmgly7HKR4iNLtHs9RlZQQVJyEGwdCwrwtGN+G8OpKCClQyYtRAIIoZeUGulY9XMOd0ijhnhMdyzWtr+/9GjsKYjGIABUoJzEJD6qVYcy0MyFA0fwjI7YwUyahGUDMmciYxLUCnPoYc7LxiZmWYguk5hUEFwa3tUbaxzPDXDxHzGb272UqatSkzihMxCZSwEBTozGrk0+c22jXUnvNel+WsLdmgiWUKBGVUxLEXT8VWQjhlaCTcalJkIILzFFIIsCElVa8Gi2KpNrC3rYEaXzDCkO23KMLH9jibNzOwIZYq5LaaWa20ehmyqPWgPVYUA7rkMSKg104FtYtCU+zNNb0K6mAwuDEuSwNySmjd1+6PLXjDGASWOa7luWjlqnjBQoZUi1gAeAtXhFidY4sTGlO73bvxKKNA8zqaCTZgQHJb1eByiCeuhBMTJzpr4NoYRJZln2Gb00FO0O/JWRWj+RrflHlAnSPXYghMs/3PUnmT7GPIEkV38aR1YOW3WxNhAQL+sS21OcRLbr3i4t9IsKFQot+kHll6fpC8vdntBif0jaGCglOrfd4JNWXL6XbygTC8TNUwvWuvhCxepmEx6LQl8NnfSkPYsOUwrNSe9z1iy5CgFgREgXcxD148ItJS+sDgEcKqdfaFjOa20WSqwgSkuW3hGEgLrw4RbFo7o26/WDfASACTe0GnTkgUAJ0pGUZSaUVua0tzaws3MiVQlxUtTUeFXiJc8FToUSK1FUtlRlbSrqteAdlYnupBDMWPKhBY11MePwH4mnysQmQUyyPiJlGhzUITcKZ+LRoYTuf/JcPG2By25Hq+1e1/grw6cuYTV5HzNlPdAo1b+kT2QkIVMQl2Sr4lf/ACqUopAYMxS2tDDzADkr7wJaXWnyHB0rdvHKfAbRCGJFwyJa09evAdp3Ypg8U+InywPlMsit/iDlRjDq5ksmSlSQVqKlo7oYFIBPIsrTjC+ElJNco7wqSHcOQH3YUjSxclGaWrKmg7tBRwxbalIa1d8q6+oH7l8RN7qmFWo9B4mAyClwVM7V1Dtu1axmdv4lQltKVlU7l/6U3qbVULCsZ8nGKYFSy4HeLljdzS1W0PhaOzGanFTi15cf6Dg4E5M9JiZyWAdy3eIDB920EVIIvZvOm0ZmAxBUDZ6OQx4RoyrZQ1Pc3pzjgxFmlfEZxcHlYPDoZzvBidb8OccEFzXyjjlHzFuZi77P8SpSZLPXAHNTnRlILkDmLbRkn8OuXCyE8RXy2jWM1D0IsWpfW/2gyRqDDYOHGLaM5XqeSxWG+GsoNdiBcG0V8PCH/wAQjvpVwbyL/WM4l7+nlCyVMZFUrY8YaJ7sJAOYevGk9gF0HSlosuTmYPf0gRLMYqpddaQqWphvFGxA1iZaO7VtYjKrY0Du9OL7xSYLF6GvCOrJTqzmeOlwBzJSREfCAHt+2sGCAVEEgMkEUO4sPGGEJ3ZLgsTZjW+o5cY0VHVvZKxfiyewlLQog0LtRw33cV4RwwhUKFwK7FuWlo055A+Yhqgn7b1byhYu+QAMeIFKM5sPzCFTt1GOr+wmeUuJBwgIaopQ5rEUJZrEv5cYhUhKFFtaO1i1W3uerNSWUB3iFGqSzi7KFeFfCK4lFTWnDYaP1aHgpaxcnptvvpVfsPe0ZOFP8Qi4sOYD25E+UfP+16Y9Zt/HB81PHuUlObMTWjJ4FgfJJeMTtX8NqnYlcyXNQDmQpSFAul7VDu+UmC3GGJKU3wat8arXrQtBykq8T101LB9yP90jXgTCXbs5UqSucg9+WkqSCHBLNWHJhHHfxekZ+IUcUjESEskj+FmJoSuUlQJAFGzEa28I8uCtp8t/JuvydTCYxGWWpKSf5S2L1srYBo8Z+BDMXPJVMWUpSxBJI71rmlEmPaYtPdPBCk+h+8eH/Ac0fHAo5TSlaCoBelCTraO6KXwJtb0r+5J99Ht+0ZC1MkVFzZncXewbbjGers6ccqQQiWCM7s5q5IIB3I00vGwpy2mnH3gSA78yGf7xz4OPKGyT8y8p3HLsDwWD+GCpVNBUVBa7cfrGpLWWdozpkwjukPsln4j29IVl4iasZC5BYU4kVPItWHwsCWK/iaKuZPExuD3NJa1MSliXZzanvCWKlKIOcpOouCDy2fXjFpaQhIJIYaA+5A4GlmeLKQcrU+VVVEAGtQBc31h1iuGi2vl1sQnHNEiVMHytSWWfKRR3IrQ1YObwQrCHylyb1YBqCnj6QAB2WXYpJFH/AKQ+lQQDEy1kFiz/AChzQEBgSqrEj0EO5qGJe4Ir5aKdrkLlOaEKDA76jyjHUdoJi5ylnvabW4+NIARAxHFy0Kw1jZYOawwFe3XXGApMEcdfpEm9RwwNLgXv5tzgcxMXzaCOWOMBPUxuHDkFSWL8Cwy89f3hHFNkI7gLUAAu1SDu/O8HmLJIdztrQP6CA4mWVrSQGO3DTRtfWLfDUpfM7k69HepxXp5/nmXWtyDmC3dKSbgBjetMz05QNUzN37DQA7J5WFvGFsSES1MQ6FOXbXgPL1h0LBZlAg18nG1a+oEFNR4EnqVmKAScwDAOzsTVtruecETiEjKkAjOCA9hY1J3ehiiJqcgCkhTGigRWjs35iTpBcGlawkqZlFw6qBiD6F4Hw46uT2vjva04ev2MvAUXOylIS5/u0I+7D1EWCwCkGrJOYguDQk+zNBVzCDRnBoeOjFqG9eMLoFFOBqzF3JqXN9X84spOMLa/34PrkNFpFTimNAk3fu/LwB1ZnB5QTstgqbMJcqSl3/sBCQNyXPkICJgCFZUsWAdybUetvmgkiYcoSQONKUIY+caozhKLjrxfKmVi3HRbhZOILnMfzE1Iol3Ao1Ga9YJgghC1KQoErUmYoEg1CcoI2DJG9TfSEsdPpZlKAP8A1f5SLXaCol5gyO6xBqQ5GtucIuzqS004bac09PQpHEeljGMxKQkqcGijlcOdQA+pZoz+ycHIlhxJQFKqO7VKSkHK+h5UjnbuMxfLmZxqNOB9IMiS2UKNCDcbsOv1iXw4qD1+hvittUh4qrcbiATsSzhL8S7/ALAUEQn5ncuKAWDD1+kQyVF0qvd7tRw7QMDDhndq1v16GxJvKq3GZKrKB0Gav5rP5N5xTDZWAOV3OYi72qLHTU6bRVEtIzZVOCzA3px24RSSJgUArupLqDNYBvlq2sUwnBTcq8a47fg2ullfgSiaLuTawanjrblzNPQlaWFVaOTXXq2sWmrQE0+XdVVAmtA9BbSASJzZQ1FFnFflvR32jXLE+bgvp5fQVNVT66YebIyy03UAA+vF07c4UkpGVhsG7ydgQ7sxfMN24wxiSyFgmgFBVmbnw6eFU0zpZgf6ksAxzAMHcuq0Qztpt8Xdj5aa8BPtOWy7fMAoeNzc6vCsuL4xbkMN3LNVyWNa8DApauhBlFxqykHaDt6wSzQKsXSYVjDCOv3iymasVlu0SoUMJYR9S8jEKZQoSC7PS2x0/SIwyyTqXLA/cnw3iVKKVKUoA5coILEMQSAK3ZrRCVlyA1ats9uUej8ssz48/v8Alex5+t2AxSg5cd0KsKsMtL/3e8SF5UlQS9EgBO1DTxJHhDU2YkMQd3IAqHYc4gzCC6U1Y8Aw0fa8Jg4tSWjdcOuYMviDSFEqCflSxIYULaK3BgqMMAAwrXKbnvVLRRw5Lh/lbM5qwLbjfxi0tQC0EkEpZgaB2bzpFNcJa8U90NCGXcri5TyxlCs7ly+1bQoMOcoLEFxb/F/Zo05pv5EDzvzDV3hdbJcMouoio1ZvJojCUop89Ouv2I0kLCWMz0KSzC1xlvxdoNJUUi4Jqmz0Nr8oAqZlKi7V1L0t7R0uY5D3JBYUOjXoR9jHQ3GcVo/bq0UjT23YdCU0Cg/rSjGLyU5SE5no+lCXteAiXWz6cHaziOVKUWYsRrf1t7w04a5rfktnf4X78Clb2CxXzak0Ip5wSTMUDRgXLMXuljfT9IB8QihPiW4Ve+nlDCJxSUlAAKU957EOKX5RPGebDSUbVX9Ku+t2HVNqqoJICyS5JrSrin2eKSD/ABCas93pla3nHf8AKWWAsnugWub+ccAqtyxZTVF6WuHBiOZpy0q16/v28Cmd8QyFdxRe5rra3AUgEslyyX+Uki4FHvRj9DFlDIWarVGvAcrRGFVmcKVlFeAa/CutYTCkoXpa6XAWa2IxdeJAbfzrt7RXDJzEDLVKiGIf0PI+kdiSpLEUA0B3OUnla0WVOzqOUKNj+UElJckOWi7zPCzR24+HX+hGlm4hcSlRCgmoykvYBg5BGtAC/GE8PMuUqzEgl8zKbKk2NGarxGKU9MpILEpatqsHqoA3pHJyAFqDvNmTSxAZtaCg5RzuDhhrx69xt5MUxeKKySoMoMC+oFEkU9L0gKYJOR3SrQ1FauWNtmLeMIfGLxsVW/3Y2C3TvmaL06pHFXQhWUaXF4sleVT/AF4RGiw2hVOrwTPTRucLDEV1tv8ApWLpWK8dOECg6D8+UM6LAglRAqzhsp0JFKwQYZKFhT1+YC2/iYIuWc6ykVCrgevKBrnlV01SXzbAilOcdrniwSUHWnzets5X8qdFpinVQZqEsOBIcg8j5G8Mf8hOVinSmjl7HhGexSlRD1d2LPp4aREySmpq/wCTXz0c1EJkzJPdXw9/7I61fMeQBUpTVn24t1vFJznKUXI1HqRwJLRYqKUhTFQUzeOvHaFFglWUnc30zMOQNT4RSDcXnzKlzXT/AGFWkPJls9agDRqtvrUPAsYgAKUSXuG10AtS8BmyQGV8R2ZhQ1NWvR7feB4cly6iSO6LnkPGkSxfnap29LpddceILd0LS1hSqBmNUtQizv424wfCoQSNwSWqLKYFzRmNBE4XDqQXylrE01ZvB4UlTmVmIVWg1qakcv1i8ZxzZU+O68luNFVSNSjFQNH/AEfbeFMPiD3swahYtr4845TtoGY2bg9G50iE55oBUwuBTT9z00VlHNo3pxd81aWm/iWSSu9V7DIKblNmNBduW9PKBFCSQM2Uhy5qBTXeLS0ISHUXNeFhSmu0VSCpVEhVSGI1NL7axzxxpJvSkvTfzJzVrcHLngKy1UkuAbOQLhxWrjyiTTKZZPfqRtrUC9H0i0rCJSp1rdswsGf+0qo9KwJyHIqwzcs1i/iKRTEySxW0709OKXDy9Q0lpEKHFad4AEHRnNNqm3nFZs0Cjkqeo2o4bUWgssO6ibAsGqdPOB/CqEkAd4hLCtA5ve/kI58Pi62+n765DzvZHLmhQKsraFy7JvmGzl/TlFxRIKeCgdWfvN5kcjCeZWXKKBV6XFiOGnnBZUkEOVANUKJIY5u8ONg99N47ZVCDU3SbXrp9tSeZ2iZzM5UQWOXLobXZ4DhZjoZyB3quB+Vy3nWHMUlASqhdqEaqZ9eXpGXJWCC6UE1d00JYEeDgtyjz41KC6+noM9Js7EzaZWvVwx0YB9LQglZCqXEPNmJ0aoZP2tr6QiRwimNSSVa8RsG9QiVUjgutYGFRZKjmbaI2WGkEbxIpWBIMFrTa3XWkIE9r2ddfjCuCtN/w+8THQv8Ay9CUuAvL+Vf+J9jC+G/N/jN9xHR0ejg/xz65nEu6OYr+TJ5/eF5P81f+Ijo6ODs/cfm/dlsXZegrL/lSf8x/uqC4f+Yr/NEdHR3v+aPl+CS265GpiLTOaPdMYU6w5iOjo5+ydyf/AF/ETtXe65j+H1/wPsILL+RPWsdHRXF7sPKPsJHeXqKY7TmYYwXzp8feJjoPaP4pB/8ARef5IX8sv/3H/eMxVp3L/wCxER0Swf4n5f5o5nv6fgcn6chBsf8AKjmf9DHR0cse/DykdM935ozp30HsmLzf/wAw/wDYr/ZETHR7Xaf4Ief+Jyvj5fkv2zab1vGL+Y/5D/VcdHR5+H/E/T2RafefXMdw1vA+0Im0THQe094fC78vQGq8UHzdbR0dECzGUX8PpDiPlMdHQjCf/9k=' );
            var materials = [
                new THREE.MeshBasicMaterial( { map: texture } ),
                new THREE.MeshPhongMaterial( { color: 0xffffff  } ),
                new THREE.MeshPhongMaterial( { color: 0xffffff  } ),
                new THREE.MeshPhongMaterial( { color: 0xffffff  } ),
                new THREE.MeshPhongMaterial( { color: 0xffffff  } ),
                new THREE.MeshPhongMaterial( { color: 0xffffff  } ),
            ];
            var mesh = new THREE.Mesh( geometry, materials );
            mesh.position.setFromMatrixPosition( reticle.matrix );
            scene.add( mesh );

        }

    }

    controller = renderer.xr.getController( 0 );
    controller.addEventListener( 'select', onSelect );
    scene.add( controller );

    reticle = new THREE.Mesh(
        new THREE.RingBufferGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add( reticle );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    renderer.setAnimationLoop( render );

}

function render( timestamp, frame ) {

    if ( frame ) {

        var referenceSpace = renderer.xr.getReferenceSpace();
        var session = renderer.xr.getSession();

        if ( hitTestSourceRequested === false ) {

            session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {

                session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

                    hitTestSource = source;

                } );

            } );

            session.addEventListener( 'end', function () {

                hitTestSourceRequested = false;
                hitTestSource = null;

            } );

            hitTestSourceRequested = true;

        }

        if ( hitTestSource ) {

            var hitTestResults = frame.getHitTestResults( hitTestSource );

            if ( hitTestResults.length ) {

                var hit = hitTestResults[ 0 ];

                reticle.visible = true;
                reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

            } else {

                reticle.visible = false;

            }

        }

    }

    renderer.render( scene, camera );

}
