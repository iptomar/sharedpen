create database sharedpen;

CREATE USER 'sharedpen'@'%' IDENTIFIED BY 'sharedpen';
GRANT insert, create, update, delete, select ON sharedpen.* To 'sharedpen'@'%' IDENTIFIED BY 'sharedpen';

CREATE TABLE  modelos_pagina (
  id int(11) NOT NULL auto_increment,
  nome varchar(20) NOT NULL,
  htmltext TEXT NOT NULL,
  icon text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

create table modelo (
    idmodelo int (11) NOT NULL auto_increment,
    nome_livro varchar (50) NOT NULL,
    nome_modelo varchar (50) NOT NULL,
    htlm_texto text,
    css_texto text NOT NULL,
    PRIMARY KEY (idmodelo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

insert into modelos_pagina (nome, htmltext) values
("Capa", '<div id="tabpage" class="tabpage">
    <div id="input1" class="editable titulo"></div>
    <div id="input2" class="editable titulo"></div>
    <input type="file" class="" accept="image/*" />
    <img id="image" class="dragandrophandler" alt="" src="">
    <div id="input3" class="editable titulo"></div></div>'),
("capa1", '<div id="tabpage" class="tabpage">
    <input type="file" class="" accept="image/*" />
    <img id="image" class="dragandrophandler" alt="" src="">
    <div id="input1" class="editable titulo"></div></div>'),
("Desenho", '<div id="tabpage" class="tabpage tabpagedraw">
    <div id="canvasdr" class="canvasdr"></div></div>'), 
('empty', '<div id="tabpage" class="tabpage">
    <div id="input1" class="editable conteudo"></div></div>'), 
("pagina", '<div id="tabpage" class="tabpage tabpage2">
    <div  id="input1"  class="editable"></div>
    <input type="file" class="" accept="image/*" />
    <img id="image" class="dragandrophandler" alt="" src="">
    <div id="textarea1"  class="editable"></div></div>');

