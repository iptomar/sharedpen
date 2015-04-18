/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Server = require('./lib/server');

var serv = new Server(8080);
serv.start();
