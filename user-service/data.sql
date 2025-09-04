alter database users character set utf8mb4 collate utf8mb4_spanish2_ci;
create table `roles` (
    id int not null auto_increment,
    name varchar(50) not null,
    primary key(id)
);
create table `users` ( 
    id varchar(100) not null, 
    name varchar(500) not null, 
    email varchar(1000) not null, 
    password varchar(100) not null, 
    physical_address varchar(2000) not null,
    role int default(1) not null ,
    primary key(id),
    constraint FK_role foreign key (`role`) references roles (`id`) on update cascade
    );

insert into roles (name) values ('Cliente');
insert into roles (name)  values ('Administrador');