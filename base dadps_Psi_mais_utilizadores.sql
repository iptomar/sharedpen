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

CREATE TABLE `modelo` (
  `idmodelo` int(11) NOT NULL AUTO_INCREMENT,
  `nome_livro` varchar(50) NOT NULL,
  `num_modeloCapa` int(11) NOT NULL,
  `num_modeloPagina` int(11) NOT NULL,
  `html_texto` text,
  `css_texto` text NOT NULL,
  PRIMARY KEY (`idmodelo`),
  Foreign Key (`num_modeloCapa`) references `modelos_pagina`(`id`),
  Foreign Key (`num_modeloPagina`) references `modelos_pagina`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (1,'A Primavera','5','9','Verão Arvores, Folhas, Fruta','{\"font-family\":\"Verdana\",\"font-size\":\"28px\",\"text-align\":\"center\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"rgba(0, 0, 0, 0)\"}');
INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (2,'gf','3','8','\n\n                    ','{\"font-family\":\"\"Times New Roman\"\",\"font-size\":\"14px\",\"text-align\":\"left\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"transparent\"}');
INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (3,'sdasd','1','6','\n\n                    ','{\"font-family\":\"Times New Roman\",\"font-size\":\"14px\",\"text-align\":\"left\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"rgba(0, 0, 0, 0)\"}');
INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (4,'qwe','2','7','\n\n                    ','{\"font-family\":\"Times New Roman\",\"font-size\":\"28px\",\"text-align\":\"center\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"rgba(0, 0, 0, 0)\"}');
INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (5,'Teste123','1','3','dfbfdb<div>afbv</div><div>dfb</div><div><br></div><div>dfb</div><div>sfd</div><div>bdf</div><div>b</div><div>sdf</div><div>b</div><div>sdfb</div><div>sdfb</div><div>sdf</div><div>bdf</div><div>b</div>','{\"font-family\":\"Times New Roman\",\"font-size\":\"32px\",\"text-align\":\"center\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"rgba(0, 0, 0, 0)\"}');
INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (6,'lol','1','4','\n\n                    ','{\"font-family\":\"\"Times New Roman\"\",\"font-size\":\"14px\",\"text-align\":\"left\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"transparent\"}');
INSERT INTO `modelo` (`idmodelo`,`nome_livro`,`num_modeloCapa`,`num_modeloPagina`,`html_texto`,`css_texto`) VALUES (7,'Teste456','1','8','Teste<div>teste</div><div>teste</div><div>teste</div>','{\"font-family\":\"Verdana\",\"font-size\":\"24px\",\"text-align\":\"center\",\"color\":\"rgb(0, 0, 0)\",\"background-color\":\"rgba(0, 0, 0, 0)\"}');


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

