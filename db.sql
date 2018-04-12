CREATE TABLE MOVIE(
   ID SERIAL PRIMARY KEY     NOT NULL,
   NAME           TEXT    NOT NULL,
   PLOT           TEXT    NOT NULL,
   POSTER         TEXT    NOT NULL,
--    IMDB           TEXT    NOT NULL,
   YEAR           INT     NOT NULL
);

CREATE TABLE CATEGORY(
   ID SERIAL PRIMARY KEY     NOT NULL,
   NAME           TEXT    NOT NULL
);

CREATE TABLE MOV_CTG(
   MOVIE_ID INT NOT NULL references MOVIE(ID),
   CATEGORY_ID INT NOT NULL references CATEGORY(ID),
   PRIMARY KEY(MOVIE_ID,CATEGORY_ID)
);

-- INSERT INTO MOVIE 
-- (NAME, PLOT, POSTER, IMDB, YEAR) 
-- VALUES 
-- ('Guardians of the Galaxy Vol. 2','The Guardians must fight to keep their newfound family together as they unravel the mystery of Peter Quill''s true parentage.','https://images-na.ssl-images-amazon.com/images/M/MV5BMTg2MzI1MTg3OF5BMl5BanBnXkFtZTgwNTU3NDA2MTI@._V1_SX300.jpg','http://www.imdb.com/title/tt3896198/',2017);

-- INSERT INTO CATEGORY (NAME) VALUES ('Robot');

-- INSERT INTO MOV_CTG 
-- (MOVIE_ID,CATEGORY_ID) 
-- VALUES 
-- (1,1);

-- DROP TABLE MOVIE;
-- DROP TABLE CATEGORY;
-- DROP TABLE MOV_CTG;