CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   
    title TEXT NOT NULL,                    
    description TEXT,                       
    completed BOOLEAN NOT NULL DEFAULT 0,   
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO todos VALUES(1,'Buy groceries','Milk, eggs, bread',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(2,'Finish project report','Due by Friday',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(3,'Call mom','Weekly check-in',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(4,'Pay electricity bill','',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(5,'Read a book','Finish chapter 5',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(6,'Workout','Gym session',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(7,'Clean kitchen','',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(8,'Plan weekend trip','Book hotel and tickets',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(9,'Reply to emails','',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(10,'Fix bike','Replace chain',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(11,'Prepare presentation','For Monday meeting',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(12,'Grocery shopping for party','Buy snacks and drinks',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(13,'Update resume','',1,'2025-11-11 10:08:02','2025-11-11 16:52:29');
INSERT INTO todos VALUES(14,'Learn SQLite','Practice queries',0,'2025-11-11 10:08:02','2025-11-11 10:08:02');
INSERT INTO todos VALUES(17,'create CI/CD pipleine for todo worker','CI/CD',0,'2025-11-20 07:21:12','2025-11-20 07:21:12');


