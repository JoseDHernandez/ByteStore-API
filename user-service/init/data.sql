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
alter database products character set utf8mb4 collate utf8mb4_spanish2_ci;
insert into roles (name) values ('Cliente');
insert into roles (name)  values ('Administrador');

insert into users (id,name,email,password,physical_address,role) values
('01991c0e-16f0-707f-9f6f-3614666caead',"José David Hernández Hortúa","jose.hernandez@test.com","$2b$13$xwnLORPonsKMxTulSmAJ9eu5b./a7qi5QaniKHSO4Ji2Y4pN0s/vK","Calle 12 #67-56",2),
('01991c11-412e-7569-bb85-a4f77ba08bb7',"María Fernanda López","maria.lopez@test.com",'$2b$13$QzfFPp4KMiNvNd8GpQEEbutkuyNjNNTjAG4.7z0zylRGPOdS1OpF6',"Carrera 45 #23-12",1);
