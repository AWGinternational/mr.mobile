-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: localhost    Database: sales_stock_db
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_categories_user` (`user_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_categories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (9,'Mobiles',29),(10,'cable',29),(11,'handfree',29),(13,'speaker',29),(14,'smart watch',29),(15,'adaptors',29),(16,'charger',29),(17,'connectors',29),(19,'Power Bank',29),(20,'covers',29),(21,'Glass Protector',29),(22,'Mobiles',27),(23,'Handfree',27),(25,'Handfrees',32),(26,'Mobiles',32),(27,'Mobiles',NULL),(28,'mobiles',NULL),(29,'mobiles',NULL),(31,'Cables',32),(32,'Cables',27),(33,'cover',27);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `closing`
--

DROP TABLE IF EXISTS `closing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `closing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `telenorLoad` decimal(10,2) NOT NULL,
  `zongLoad` decimal(10,2) NOT NULL,
  `jazzLoad` decimal(10,2) NOT NULL,
  `ufoneLoad` decimal(10,2) NOT NULL,
  `easypaisa` decimal(10,2) NOT NULL,
  `jazzCash` decimal(10,2) NOT NULL,
  `loan` decimal(10,2) NOT NULL,
  `cash` decimal(10,2) NOT NULL,
  `bank` decimal(10,2) NOT NULL,
  `credit` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `user_id` int DEFAULT NULL,
  `updated` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_closing_user` (`user_id`),
  CONSTRAINT `closing_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_closing_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `closing`
--

LOCK TABLES `closing` WRITE;
/*!40000 ALTER TABLE `closing` DISABLE KEYS */;
INSERT INTO `closing` VALUES (1,'2024-01-16',100.00,200.00,300.00,400.00,500.00,600.00,700.00,800.00,900.00,1000.00,3500.00,29,0),(2,'2024-01-16',200.00,300.00,400.00,500.00,600.00,700.00,800.00,900.00,1000.00,1600.00,3800.00,29,0),(3,'2024-01-16',1000.00,1500.00,2000.00,2500.00,3000.00,3500.00,4000.00,4500.00,5000.00,5500.00,21500.00,29,0),(4,'2024-01-16',1000.00,1500.00,2000.00,2500.00,3000.00,3500.00,4000.00,4500.00,5000.00,15500.00,11500.00,29,0),(5,'2024-01-16',100.00,200.00,300.00,400.00,500.00,600.00,700.00,8000.00,16000.00,30000.00,-3200.00,29,0),(6,'2024-01-27',100.00,200.00,300.00,400.00,500.00,600.00,700.00,800.00,900.00,3000.00,1500.00,29,0),(7,'2024-02-10',300.00,200.00,7006.00,6000.00,9000.00,1600.00,134000.00,5400.00,18000.00,130000.00,51506.00,29,0),(8,'2024-02-11',100.00,200.00,300.00,400.00,500.00,600.00,135400.00,800.00,2000.00,150000.00,-9700.00,29,0),(9,'2024-02-12',1000.00,2000.00,300.00,500.00,500.00,1600.00,140400.00,10000.00,5000.00,125000.00,36300.00,29,0),(10,'2025-01-23',500.00,100.00,450.00,1800.00,35000.00,14000.00,193600.00,1200.00,21200.00,90000.00,177850.00,27,1),(11,'2025-01-23',700.00,0.00,0.00,0.00,0.00,0.00,193600.00,0.00,0.00,0.00,194300.00,27,0),(12,'2025-01-23',400.00,700.00,645.00,1000.00,14000.00,13000.00,193600.00,21000.00,16000.00,50000.00,210345.00,27,0),(13,'2025-01-25',400.00,500.00,600.00,700.00,800.00,900.00,193600.00,11000.00,1600.00,50000.00,160100.00,27,0),(14,'2025-01-25',300.00,400.00,500.00,600.00,700.00,800.00,193600.00,1100.00,2200.00,5000.00,195200.00,27,0);
/*!40000 ALTER TABLE `closing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commissions`
--

DROP TABLE IF EXISTS `commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `phone` varchar(11) NOT NULL DEFAULT '0',
  `amount` decimal(10,2) NOT NULL,
  `profit` decimal(10,2) NOT NULL,
  `service` varchar(20) NOT NULL,
  `company` varchar(20) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discountAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `user_id` int DEFAULT NULL,
  `updated` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_commissions_user` (`user_id`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_commissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commissions`
--

LOCK TABLES `commissions` WRITE;
/*!40000 ALTER TABLE `commissions` DISABLE KEYS */;
INSERT INTO `commissions` VALUES (1,'2024-01-15','03305000247',8000.00,80.00,'easypaisa',NULL,0.00,0.00,29,0),(2,'2024-01-14','03305000247',25000.00,250.00,'easypaisa',NULL,5.00,12.50,29,0),(3,'2024-01-14','03345465851',-4000.00,0.00,'jazzcash',NULL,0.00,0.00,29,0),(4,'2024-01-15','03325809703',3000.00,30.00,'jazzcash',NULL,0.00,0.00,29,0),(5,'2024-01-17','03317894561',3000.00,30.00,'easypaisa',NULL,0.00,0.00,29,0),(6,'2024-01-17','03317896541',-6000.00,0.00,'easypaisa',NULL,0.00,0.00,29,0),(7,'2024-01-20','03451234567',60000.00,600.00,'easypaisa',NULL,0.00,0.00,29,0),(8,'2024-01-20','03345465851',80000.00,800.00,'jazzcash',NULL,18.00,144.00,29,0),(9,'2024-01-20','03332863920',16000.00,160.00,'jazzcash',NULL,0.00,0.00,29,0),(10,'2024-01-20','03171122334',21000.00,197.40,'easypaisa',NULL,6.00,12.60,29,0),(11,'2024-01-20','03171122378',21000.00,197.40,'jazzcash',NULL,6.00,12.60,29,0),(12,'2024-01-20','03121234567',21000.00,197.00,'jazzcash',NULL,6.00,12.60,29,0),(13,'2024-01-20','03305000247',1600.00,16.00,'jazzcash',NULL,0.00,0.00,29,0),(14,'2024-01-20','03345465851',1800.00,18.00,'easypaisa',NULL,0.00,0.00,29,0),(15,'2024-01-21','03332863920',10000.00,100.00,'easypaisa',NULL,0.00,0.00,29,0),(16,'2024-01-21','03332863920',10000.00,100.00,'easypaisa',NULL,0.00,0.00,29,0),(17,'2024-01-21','03332863920',10000.00,100.00,'easypaisa',NULL,0.00,0.00,29,0),(18,'2024-01-21','03315901234',30000.00,285.00,'easypaisa',NULL,5.00,15.00,29,0),(19,'2024-01-26','03065816928',6000.00,57.00,'easypaisa',NULL,5.00,3.00,29,0),(20,'2024-01-27','03363361129',16000.00,160.00,'easypaisa',NULL,0.00,0.00,29,0),(21,'2024-02-07','03301236547',20000.00,200.00,'easypaisa',NULL,0.00,0.00,29,0),(22,'2024-02-11','03311236548',16000.00,152.00,'easypaisa',NULL,5.00,8.00,29,0),(23,'2024-02-12','03305000247',15000.00,146.00,'easypaisa',NULL,3.00,4.50,29,0),(24,'2024-02-12','03305000246',20000.00,190.00,'jazzcash',NULL,5.00,10.00,29,0),(25,'2024-02-21','03305000247',2000.00,19.00,'easypaisa',NULL,5.00,1.00,29,0),(26,'2024-02-21','03305000246',20000.00,190.00,'easypaisa',NULL,5.00,10.00,29,0),(27,'2024-02-25','03135389531',20000.00,190.00,'easypaisa',NULL,5.00,10.00,29,0),(28,'2024-02-25','03135389531',15000.00,143.00,'jazzcash',NULL,5.00,7.50,29,0),(29,'2024-02-25','03345465851',20000.00,190.00,'easypaisa',NULL,5.00,10.00,29,0),(30,'2024-06-04','03332863920',25000.00,225.00,'easypaisa',NULL,10.00,25.00,29,0),(31,'2024-07-29','03345465851',2000.00,20.00,'jazzcash',NULL,0.00,0.00,29,0),(32,'2024-07-29','03345465856',2000000.00,20000.00,'jazzcash',NULL,0.00,0.00,29,0),(33,'2024-07-29','03451234567',8000.00,80.00,'easypaisa',NULL,0.00,0.00,29,0),(34,'2024-12-26','65156161',50000.00,500.00,'jazzcash',NULL,0.00,0.00,29,0),(35,'2024-12-26','65156161',50000.00,250.00,'jazzcash',NULL,50.00,250.00,29,0),(36,'2024-12-26','65156161',50000.00,-3150.00,'jazzcash',NULL,730.00,3650.00,29,0),(37,'2025-01-22','03345465851',17000.00,170.00,'Jazz Cash',NULL,0.00,0.00,27,0),(38,'2025-01-22','03305000247',3000.00,26.00,'Jazz Cash',NULL,15.00,4.50,27,0),(39,'2025-01-22','03451234567',16000.00,366.00,'Easy Load','Ufone',50.00,80.00,27,1),(40,'2025-01-22','03065816928',35000.00,290.00,'Easy Paisa',NULL,60.00,210.00,27,0),(41,'2025-01-22','0',18000.00,360.00,'Bank',NULL,0.00,0.00,27,1),(42,'2025-01-22','0',1000.00,26.00,'Easy Load','Ufone',0.00,0.00,27,1),(43,'2025-01-22','0',4000.00,104.00,'Easy Load','Ufone',0.00,0.00,27,1),(44,'2025-01-23','0',4000.00,104.00,'Easy Load','Telenor',0.00,0.00,27,1),(45,'2025-01-23','0',6000.00,156.00,'Easy Load','Zong',0.00,0.00,27,1),(46,'2025-01-23','0',5000.00,130.00,'Easy Load','Jazz',0.00,0.00,27,0),(47,'2025-01-25','0',60000.00,600.00,'Jazz Cash',NULL,0.00,0.00,27,0),(48,'2025-01-26','03345465851',40000.00,800.00,'Easy Load','Ufone',0.00,0.00,27,0),(49,'2025-01-26','0',2000.00,40.00,'Easy Load','Zong',0.00,0.00,27,0),(50,'2025-01-27','0',1000.00,10.00,'Jazz Cash',NULL,0.00,0.00,27,0),(51,'2025-01-27','0',3000.00,78.00,'Easy Load','Zong',0.00,0.00,27,1),(52,'2025-01-27','0',10000.00,200.00,'Bank',NULL,0.00,0.00,27,0),(53,'2025-01-27','0',4000.00,40.00,'Easy Paisa',NULL,0.00,0.00,27,0),(54,'2025-02-02','0',4000.00,104.00,'Easy Load','Jazz',0.00,0.00,27,0),(55,'2025-02-15','03465363669',4000.00,80.00,'Bank',NULL,0.00,0.00,27,0);
/*!40000 ALTER TABLE `commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `cnic` varchar(15) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `credit_score` decimal(5,2) DEFAULT '70.00',
  `loan_limit` decimal(10,2) DEFAULT NULL,
  `active_loans` int DEFAULT '0',
  `total_loans` int DEFAULT '0',
  `last_loan_date` date DEFAULT NULL,
  `risk_category` enum('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnic` (`cnic`),
  KEY `fk_customer_user` (`user_id`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_customer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Abdul Wahab','house No 85, Street 1, Korang Town, Islamabad','3730320613933','+923305000247',29,70.00,NULL,0,0,NULL,'MEDIUM'),(2,'alisha','house 53, dha 2, islamabad','3730315428359','03348569463',29,70.00,NULL,0,0,NULL,'MEDIUM'),(3,'hanan','house No 85, Street 1, Korang Town, Islamabad','3730323006879','03368880020',29,70.00,NULL,0,0,NULL,'MEDIUM'),(4,'bareera','house 53, dha 2, islamabad','3730323580619','03332863920',29,70.00,NULL,0,0,NULL,'MEDIUM'),(5,'alisha','house 53, dha 2, islamabad','3730320613934','+923332863920',29,70.00,NULL,0,0,NULL,'MEDIUM'),(18,'Wahab','house No 85, Street 1, Korang Town, Islamabad','3728259292262','+923345465851',29,70.00,NULL,0,0,NULL,'MEDIUM'),(19,'abdul ghaffar','tibbi bangla , tehsil sohawa, district jhelum','3730312345679','03345465851',29,70.00,NULL,0,0,NULL,'MEDIUM'),(20,'talat habiba','tibbi bangla, sohawa, jehlum','3730320613958','+923332863920',29,70.00,NULL,0,0,NULL,'MEDIUM'),(24,'Abdul wahab','tibbi bangla, sohawa, jehlum','3730320611759','03305000247',29,70.00,NULL,0,0,NULL,'MEDIUM'),(25,'huma sheraz','cust university','37303123456789','0333scvjsnvcj',29,70.00,NULL,0,0,NULL,'MEDIUM'),(26,'usman','cust','3730318692751','03331824357',29,70.00,NULL,0,0,NULL,'MEDIUM'),(27,'nuray','house 85,street1,korang town','3730320813933','03335111247',29,70.00,NULL,0,0,NULL,'MEDIUM'),(28,'Nadeem','soan garden','3730345612377','03451234567',29,70.00,NULL,0,0,NULL,'MEDIUM'),(31,'jawad','dha2','3730312345698','03319837590',29,70.00,NULL,0,0,NULL,'MEDIUM'),(32,'ahsan','house No 85, Street 1, Korang Town, Islamabad','3730312398748','03065816928',29,70.00,NULL,0,0,NULL,'MEDIUM'),(33,'Danial umer','apartment 3B, block 2, askari tower','3730314648663','03363361129',29,70.00,NULL,0,0,NULL,'MEDIUM'),(34,'danish Ali','cust university','3730320613935','03311236547',29,70.00,NULL,0,0,NULL,'MEDIUM'),(35,'UBAID ULLAH AKHTAR','shop 7, ufine franchise pwd','3730365295333','03038152415',29,70.00,NULL,0,0,NULL,'MEDIUM'),(36,'Abdul Wahab','house 1, korang town','3730320723933','03305010149',27,70.00,NULL,0,0,NULL,'MEDIUM'),(39,'umair','hosue 5','3730323580617','03305000146',27,70.00,NULL,0,0,NULL,'MEDIUM');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_loan_history`
--

DROP TABLE IF EXISTS `customer_loan_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_loan_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `loan_count` int DEFAULT '0',
  `total_amount_borrowed` decimal(10,2) DEFAULT '0.00',
  `total_amount_paid` decimal(10,2) DEFAULT '0.00',
  `average_payment_time` int DEFAULT NULL,
  `credit_score` decimal(5,2) DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_loan_history_customer_id` (`customer_id`),
  CONSTRAINT `customer_loan_history_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_loan_history`
--

LOCK TABLES `customer_loan_history` WRITE;
/*!40000 ALTER TABLE `customer_loan_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_loan_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giveloan`
--

DROP TABLE IF EXISTS `giveloan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giveloan` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `installment` int DEFAULT NULL,
  `monthly_installment` decimal(10,2) DEFAULT NULL,
  `remaining_amount` decimal(10,2) DEFAULT '0.00',
  `total_loan` decimal(10,2) NOT NULL DEFAULT '0.00',
  `user_id` int DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'Pending',
  `last_payment_date` date DEFAULT NULL,
  `next_payment_date` date DEFAULT NULL,
  `payment_reminders` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`loan_id`),
  KEY `fk_giveloan_user` (`user_id`),
  CONSTRAINT `fk_giveloan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `giveloan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giveloan`
--

LOCK TABLES `giveloan` WRITE;
/*!40000 ALTER TABLE `giveloan` DISABLE KEYS */;
INSERT INTO `giveloan` VALUES (35,'2024-01-12','330222','alisha',5200.00,4,1300.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(36,'2024-01-12','259589','bareera',3000.00,3,1000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(37,'2024-01-12','148295','talat habiba',3000.00,3,1000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(38,'2024-01-12','158607','nuray',3000.00,6,500.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(39,'2024-01-12','199096','barrea',500.00,1,500.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(40,'2024-01-12','939168','soban',6000.00,5,1200.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(41,'2024-01-12','196043','hanan',300.00,2,150.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(42,'2024-01-12','145365','ahsan',400.00,2,200.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(43,'2024-01-12','220135','usman',8000.00,2,4000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(44,'2024-01-14','939471','raja iqbal',4000.00,4,1000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(45,'2024-01-16','275663','mohsin',6000.00,2,3000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(46,'2024-01-16','107534','danish',2000.00,3,666.67,0.00,193600.00,29,'Pending',NULL,NULL,1),(47,'2024-01-16','190195','huma',3000.00,1,3000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(48,'2024-01-16','767388','ahmad',3200.00,6,533.33,0.00,193600.00,29,'Pending',NULL,NULL,1),(49,'2024-01-16','125539','usman ali',4000.00,2,2000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(50,'2024-01-16','117304','abdul',7000.00,1,7000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(51,'2024-01-16','720527','guujar',600.00,1,600.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(52,'2024-01-16','285722','bareera zarish',9000.00,6,1500.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(53,'2024-01-16','168894','imran',3000.00,1,3000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(54,'2024-01-16','128792','khan',6000.00,1,6000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(55,'2024-01-16','142238','sattar',900.00,1,900.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(56,'2024-01-16','333410','shahazad',1600.00,1,1600.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(60,'2024-01-17','405843','riza',1600.00,1,1600.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(61,'2024-01-19','180811','raja tayyab',1600.00,2,800.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(62,'2024-01-19','282205','usama',600.00,1,600.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(63,'2024-01-19','320888','hassan',9000.00,12,750.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(64,'2024-01-19','117207','romana',2000.00,6,333.33,0.00,193600.00,29,'Pending',NULL,NULL,1),(65,'2024-01-20','321473','Nadeem',3000.00,3,1000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(66,'2024-01-20','326141','hanan',20000.00,6,3333.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(67,'2024-01-20','174604','abdul ghaffar',1100.00,1,1100.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(68,'2024-01-20','350931','huma sheraz',2800.00,4,700.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(69,'2024-01-21','259323','jawad',3000.00,4,750.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(70,'2024-01-24','168059','ahsan',2000.00,3,666.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(72,'2024-02-11','147262','danish Ali',3000.00,3,1000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(73,'2024-02-12','260102','alisha',5000.00,5,1000.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(74,'2024-02-25','293047','Danial umer',30000.00,12,2500.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(75,'2024-02-25','454016','UBAID ULLAH AKHTAR',23000.00,6,3833.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(76,'2024-02-25','187273','UBAID ULLAH AKHTAR',200.00,1,200.00,0.00,193600.00,29,'Pending',NULL,NULL,1),(83,'2025-02-08','334816','Abdul Wahab',4000.00,1,4000.00,0.00,0.00,27,'Pending',NULL,NULL,1),(84,'2025-02-14','259751','Nadeem',3000.00,4,750.00,0.00,0.00,27,'Pending',NULL,NULL,1),(85,'2025-02-14','253325','umair',400.00,1,400.00,-400.00,0.00,27,'Completed','2025-02-15',NULL,1),(86,'2025-02-15','257744','Nadeem',16000.00,3,5333.00,0.00,0.00,27,'Pending',NULL,NULL,1),(87,'2025-02-15','117311','Abdul Wahab',2000.00,2,1000.00,0.00,0.00,27,'Pending',NULL,NULL,1),(88,'2025-02-16','238440','Abdul Wahab',5000.00,4,1250.00,0.00,0.00,27,'Pending',NULL,NULL,1);
/*!40000 ALTER TABLE `giveloan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `category_name` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `sku` varchar(10) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inventory_user` (`user_id`),
  CONSTRAINT `fk_inventory_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,'2023-12-19',NULL,'jsbsjfb','abdul wahab','NO NULL',300.00,0.00,10,3000.00,29),(2,'2023-12-19',NULL,'huawei','nadeem','NO NULL',250.00,0.00,10,2500.00,29),(4,'2023-12-19',NULL,'jsbsjfb','abdul wahab','NO NULL',300.00,0.00,50,15000.00,29),(5,'2023-12-19',NULL,'jsbsjfb','abdul wahab','NO NULL',300.00,0.00,50,15000.00,29),(6,'2023-12-19',NULL,'huawei','nadeem','NO NULL',250.00,0.00,50,12500.00,29),(7,'2023-12-19',NULL,'abcd','nadeem','NO NULL',6200.00,0.00,3,18600.00,29),(8,'2023-12-19',NULL,'jsbsjfb','abfj','NO NULL',300.00,0.00,5,1500.00,29),(9,'2023-12-19',NULL,'abcd','nadeem','NO NULL',6200.00,0.00,80,496000.00,29),(10,'2023-12-22',NULL,'huawei','abdul hanan','NO NULL',250.00,0.00,2,500.00,29),(11,'2023-12-22',NULL,'abcd','nadeem','NO NULL',6200.00,0.00,50,310000.00,29),(12,'2023-12-23',NULL,'huawei','abdul wahab','NO NULL',250.00,0.00,30,7500.00,29),(13,'2023-12-23',NULL,'Iphone 13','abdul wahab','NO NULL',195000.00,0.00,2,390000.00,29),(14,'2023-12-23',NULL,'infinix','abdul hanan','NO NULL',200.00,0.00,50,10000.00,29),(15,'2023-12-25',NULL,'Iphone 13','nadeem','NO NULL',195000.00,0.00,2,390000.00,29),(16,'2023-12-31',NULL,'Redmi Note 8','nadeem','NO NULL',150.00,0.00,2,450.00,29),(17,'2024-01-23',NULL,'iphone cabe local','abdul wahab','NO NULL',300.00,0.00,9,3000.00,29),(18,'2024-01-23',NULL,'jbl chota speaker','ibrahim khan','NO NULL',1300.00,0.00,1,2600.00,29),(19,'2024-01-24',NULL,'iphone cabe local','ibrahim khan','NO NULL',300.00,70.00,19,1400.00,29),(20,'2024-01-24',NULL,'ultra watch 8','ibrahim khan','NO NULL',8000.00,2100.00,2,4200.00,29),(21,'2024-01-27',NULL,'3.1A erorex charger','abdul wahab','NO NULL',350.00,70.00,5,350.00,29),(22,'2024-02-11',NULL,'Iphone Connector','Danish Ali','NO NULL',450.00,180.00,2,360.00,29),(23,'2024-02-21',NULL,'iphone cabe local','abdul wahab','NO NULL',300.00,70.00,0,70.00,29),(24,'2024-02-21',NULL,'erorex handfree','abdul wahab','NO NULL',2000.00,0.00,-1,0.00,29),(25,'2024-02-21',NULL,'Redmi Note 8','abdul wahab','NO NULL',150.00,0.00,0,0.00,29),(26,'2024-02-21',NULL,'ronin bass','abdul wahab','NO NULL',700.00,490.00,0,490.00,29),(27,'2024-02-21',NULL,'jbl chota speaker','abdul wahab','NO NULL',1300.00,600.00,0,600.00,29),(28,'2024-02-21',NULL,'ronin bass','abdul wahab','1',700.00,490.00,0,490.00,29),(29,'2024-02-21',NULL,'ronin bass','abdul wahab','1',700.00,490.00,0,490.00,29),(30,'2024-02-21',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,600.00,0,600.00,29),(31,'2024-02-24',NULL,'type-c','abdul wahab','86374',300.00,110.00,0,220.00,29),(32,'2024-02-24',NULL,'KTS-1057','fancy traders','06301',1500.00,650.00,0,1950.00,29),(33,'2024-02-24',NULL,'3.1A charger','abdul wahab','43826',300.00,0.00,0,0.00,29),(34,'2024-02-25',NULL,'Sy186','abdul wahab','40162',3000.00,1100.00,0,1100.00,29),(35,'2024-02-25',NULL,'OG glass','Danish Ali','24061',400.00,100.00,0,500.00,29),(36,'2024-02-25',NULL,'OG glass','abdul wahab','24061',400.00,100.00,5,500.00,29),(37,'2024-02-25',NULL,'9d','fancy traders','97367',200.00,40.00,0,200.00,29),(38,'2024-02-26',NULL,'samsung s24 ultra','abdul wahab','85140',329000.00,322000.00,0,322000.00,29),(39,'2024-02-26',NULL,'vip good','abdul wahab','29699',200.00,70.00,0,0.00,29),(40,'2024-02-26',NULL,'erorex','abdul wahab','88308',3000.00,1700.00,9,15300.00,29),(41,'2024-02-28',NULL,'vip good','abdul wahab','29699',200.00,70.00,1,70.00,29),(42,'2024-02-28',NULL,'vip good','abdul wahab','29699',200.00,70.00,5,350.00,29),(44,'2024-02-20',NULL,'ronin bass','abdul wahab','1',700.00,490.00,2,980.00,29),(45,'2024-02-19',NULL,'ronin bass','abdul wahab','1',700.00,490.00,5,2450.00,29),(46,'2024-02-18',NULL,'ronin bass','abdul wahab','1',700.00,490.00,7,3430.00,29),(47,'2024-02-17',NULL,'ronin bass','abdul wahab','1',700.00,490.00,4,1960.00,29),(48,'2024-02-25',NULL,'samsung s24 ultra','abdul wahab','85140',329000.00,322000.00,1,322000.00,29),(49,'2024-02-20',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,600.00,2,1200.00,29),(50,'2024-02-19',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,600.00,5,3000.00,29),(51,'2024-02-18',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,600.00,8,4800.00,29),(52,'2024-02-17',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,700.00,8,5600.00,29),(53,'2024-02-16',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,200.00,8,1600.00,29),(54,'2024-02-15',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,200.00,5,1000.00,29),(55,'2024-02-14',NULL,'jbl chota speaker','abdul wahab','09207',1300.00,200.00,7,1400.00,29),(56,'2024-02-27',NULL,'vip good','abdul wahab','29699',200.00,70.00,13,910.00,29),(57,'2024-02-26',NULL,'vip good','abdul wahab','29699',200.00,70.00,15,1050.00,29),(60,'2024-11-12',NULL,'Iphone Connector','ibrahim khan','88786',450.00,180.00,5,900.00,29),(61,'2024-11-13',NULL,'iphone cabe local','abdul wahab','92782',300.00,70.00,2,140.00,29),(62,'2024-11-14',NULL,'ultra watch 8','nadeem','19883',8000.00,2100.00,2,4200.00,29),(63,'2024-11-14','smart watch','ultra watch 8','ibrahim khan','19883',8000.00,2100.00,3,6300.00,29),(64,'2024-11-14','speaker','KTS-1057','abdul hanan','06301',1500.00,650.00,3,1950.00,29),(65,'2024-11-14','handfree','erorex handfree','abdul wahab','61249',2000.00,0.00,1,0.00,29),(67,'2024-11-14','Power Bank','erorex','abdul hanan','88308',3000.00,1700.00,2,3400.00,29),(69,'2025-01-27','Handfree','Erorex M22','abdul wahab','32948',300.00,140.00,21,1400.00,27),(78,'2025-01-15','Handfrees','Erorex M22','abdul wahab','28729',300.00,140.00,4,700.00,32),(80,'2025-01-15','Cables','Ronin 2A','abdul wahab','67066',700.00,250.00,2,500.00,32),(81,'2025-01-14','Cables','Huawei 3A cable','abdul wahab','33510',200.00,60.00,1,180.00,32),(82,'2025-01-21','Mobiles','Redmi 13C','abdul wahab','65946',33000.00,31000.00,4,155000.00,27),(84,'2025-01-23','Cables','Huawei 3A','abdul wahab','59492',300.00,70.00,17,980.00,27);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_payment_history`
--

DROP TABLE IF EXISTS `loan_payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_payment_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `remaining_amount` decimal(10,2) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `loan_payment_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_payment_history`
--

LOCK TABLES `loan_payment_history` WRITE;
/*!40000 ALTER TABLE `loan_payment_history` DISABLE KEYS */;
INSERT INTO `loan_payment_history` VALUES (1,'253325','2025-02-15',400.00,'full_amount',0.00,27,'2025-02-15 10:07:25');
/*!40000 ALTER TABLE `loan_payment_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(5) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `categoryName` varchar(255) NOT NULL,
  `cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_products_user` (`user_id`),
  CONSTRAINT `fk_products_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (40,'44444','Infinix Charger Cable','High-quality USB cable for Infinix phones',250.00,'cable',50.00,29),(41,'55555','Huawei Type-C Cable','Durable Type-C cable for Huawei devices',220.00,'cable',40.00,29),(43,'77777','iPhone Lightning Cable','Original Apple Lightning cable for iPhones',300.00,'cable',70.00,29),(44,'88888','Xiaomi USB-C Cable','Xiaomi-branded USB-C cable for various devices',12.00,'cable',0.00,29),(45,'12345','Redmi Note 8','Budget-friendly smartphone',150.00,'Mobiles',0.00,29),(46,'67890','Samsung Galaxy S21','Flagship phone with great camera',6200.00,'Mobiles',1700.00,29),(47,'11111','Infinix Hot 10','Budget-friendly phone with large display',250.00,'cable',0.00,29),(48,'22222','Huawei P30','Premium smartphone with Leica cameras',300.00,'cable',0.00,29),(49,'33333','iPhone 13 Pro Max','Flagship iPhone with advanced features',195000.00,'Mobiles',0.00,29),(50,'19703','audionic','Boss-5, great quality',2000.00,'speakers',0.00,29),(51,'61249','erorex handfree','High Class Bass, outclass quality with noise cancellation',2000.00,'handfree',0.00,29),(52,'52908','3.1A erorex charger','3.1 A ultra fast charger good quality and make battery health good ',350.00,'chargers',70.00,29),(53,'43826','3.1A charger','fast',300.00,'chargers',0.00,29),(54,'88179','ronin bass','good quality',700.00,'handfree',490.00,29),(55,'92782','iphone cabe local','local quality',300.00,'cable',70.00,29),(56,'09207','jbl chota speaker','outclass quality',1300.00,'speakers',600.00,29),(57,'19883','ultra watch 8','good quality',8000.00,'smart watch',2100.00,29),(58,'88786','Iphone Connector','Iphone to c connector',450.00,'connectors',180.00,29),(59,'86374','type-c','typec -to A conncteor',300.00,'connectors',110.00,29),(60,'06301','KTS-1057','speaker2',1500.00,'speaker',650.00,29),(61,'40162','Sy186','10000 Mah battery',3000.00,'Power Bank',1100.00,29),(62,'24061','OG glass','VIP Glass',400.00,'Glass Protector',100.00,29),(63,'97367','9d','good quality',200.00,'Glass Protector',40.00,29),(64,'85140','samsung s24 ultra','200 mp',329000.00,'Mobiles',322000.00,29),(65,'29699','vip good','camon 18',200.00,'covers',70.00,29),(66,'88308','erorex','vip 10000mah',3000.00,'Power Bank',1700.00,29),(67,'01841','erorex 2.1A','erorrex 1 m',300.00,'cable',140.00,29),(70,'62963','Iphone 13 pro max','64Gb',135000.00,'Mobiles',127000.00,32),(72,'28729','Erorex M22','good quality',300.00,'Handfrees',140.00,32),(73,'33510','Huawei 3A cable','Good Quality',200.00,'Cables',60.00,32),(74,'67066','Ronin 2A','good',700.00,'Cables',250.00,32),(75,'65946','Redmi 13C','Good 8 128GB',33000.00,'Mobiles',31000.00,27),(76,'59492','Huawei 3A','3 Ampere cable',300.00,'Cables',70.00,27);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receiveloan`
--

DROP TABLE IF EXISTS `receiveloan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receiveloan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `loan_type` varchar(50) NOT NULL,
  `installment_amount` decimal(10,2) DEFAULT NULL,
  `total_installment` int DEFAULT NULL,
  `installment_number` int DEFAULT NULL,
  `remaining_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receiveloan_user` (`user_id`),
  CONSTRAINT `fk_receiveloan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `receiveloan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receiveloan`
--

LOCK TABLES `receiveloan` WRITE;
/*!40000 ALTER TABLE `receiveloan` DISABLE KEYS */;
INSERT INTO `receiveloan` VALUES (4,'2024-01-13','158607','nuray',3000.00,'monthly_installment',500.00,6,1,2500.00,'2024-01-13 19:47:30',29),(5,'2024-01-13','179245','abdul wahab',6000.00,'monthly_installment',3000.00,2,1,3000.00,'2024-01-13 19:53:24',29),(9,'2024-01-16','275663','mohsin',6000.00,'monthly_installment',3000.00,2,1,3000.00,'2024-01-16 11:10:21',29),(10,'2024-01-16','107534','danish',2000.00,'monthly_installment',666.67,3,1,1333.34,'2024-01-16 11:19:01',29),(11,'2024-01-16','107534','danish',1333.34,'monthly_installment',666.67,3,2,666.67,'2024-01-16 11:21:01',29),(12,'2024-01-20','179245','abdul wahab',3000.00,'monthly_installment',3000.00,2,2,0.00,'2024-01-20 08:30:54',29),(13,'2024-01-20','321473','Nadeem',3000.00,'monthly_installment',1000.00,3,1,2000.00,'2024-01-20 08:41:02',29),(14,'2024-01-20','326141','hanan',20000.00,'monthly_installment',3333.00,6,1,16665.00,'2024-01-20 09:00:30',29),(15,'2024-01-20','350931','huma sheraz',2800.00,'monthly_installment',700.00,4,0,2100.00,'2024-01-20 09:15:44',29),(16,'2024-01-20','350931','huma sheraz',2100.00,'monthly_installment',700.00,4,2,1400.00,'2024-01-20 15:04:00',29),(17,'2024-01-21','259323','jawad',3000.00,'monthly_installment',750.00,4,1,2250.00,'2024-01-21 11:14:19',29),(18,'2024-01-27','179245','abdul wahab',3000.00,'monthly_installment',3000.00,2,2,0.00,'2024-01-27 15:14:27',29),(19,'2024-02-06','226268','Danial umer',1600.00,'monthly_installment',320.00,5,1,1280.00,'2024-02-06 21:48:49',29),(20,'2024-02-06','226268','Danial umer',1280.00,'monthly_installment',320.00,5,2,960.00,'2024-02-06 21:49:29',29),(21,'2024-02-11','147262','danish Ali',3000.00,'monthly_installment',1000.00,3,1,2000.00,'2024-02-11 17:24:25',29),(22,'2024-02-12','260102','alisha',5000.00,'monthly_installment',1000.00,5,1,4000.00,'2024-02-12 10:04:51',29),(23,'2024-02-12','260102','alisha',4000.00,'monthly_installment',1000.00,5,2,3000.00,'2024-02-12 10:05:45',29),(24,'2024-02-13','259323','jawad',2250.00,'full_amount',0.00,0,0,0.00,'2024-02-13 11:54:52',29),(25,'2024-02-25','293047','Danial umer',30000.00,'monthly_installment',2500.00,12,1,27500.00,'2024-02-25 09:07:41',29),(26,'2024-02-25','454016','UBAID ULLAH AKHTAR',23000.00,'monthly_installment',3833.00,6,1,19165.00,'2024-02-25 10:47:37',29),(27,'2024-02-25','187273','UBAID ULLAH AKHTAR',200.00,'full_amount',0.00,0,0,0.00,'2024-02-25 10:53:03',29),(28,'2024-06-03','179245','abdul wahab',3000.00,'monthly_installment',3000.00,2,1,3000.00,'2024-06-03 20:14:34',29),(29,'2024-11-10','179245','abdul wahab',3000.00,'full_amount',0.00,0,0,0.00,'2024-11-10 08:34:09',29),(36,'2025-02-14','334816','Abdul Wahab',4000.00,'full_amount',0.00,0,0,0.00,'2025-02-14 09:36:29',27),(37,'2025-02-15','253325','umair',400.00,'full_amount',0.00,0,0,0.00,'2025-02-15 10:07:25',27),(38,'2025-02-15','253325','umair',1600.00,'full_amount',0.00,0,0,0.00,'2025-02-15 14:02:13',27);
/*!40000 ALTER TABLE `receiveloan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `categoryName` varchar(255) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cost` decimal(10,2) NOT NULL,
  `profit` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_user` (`user_id`),
  CONSTRAINT `fk_sales_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(4,'2023-12-31','cable','Infinix Charger Cable','',5,10.00,0.00,0.00,0.00,50.00,29),(5,'2023-12-31','Mobiles','Huawei Type-C Cable','',4,15.00,0.00,0.00,60.00,60.00,29),(6,'2024-01-01','Mobiles','Huawei P30','',2,300.00,0.00,0.00,0.00,600.00,29),(7,'2024-01-02','Mobiles','iPhone 13 Pro Max','',5,195000.00,0.00,0.00,0.00,975000.00,29),(8,'2024-01-20','speakers','Infinix Charger Cable','',2,10.00,0.00,0.00,0.00,20.00,29),(9,'2024-01-24','speakers','jbl chota speaker','',2,1300.00,0.00,600.00,0.00,1400.00,29),(10,'2024-01-24','chargers','3.1A erorex charger','',1,350.00,0.00,70.00,0.00,280.00,29),(11,'2024-01-24','handfree','3.1A erorex charger','',1,350.00,0.00,70.00,0.00,280.00,29),(12,'2024-01-24','speakers','jbl chota speaker','',1,1300.00,0.00,600.00,0.00,700.00,29),(13,'2024-01-24','smart watch','ultra watch 8','',1,8000.00,0.00,2100.00,0.00,5900.00,29),(14,'2024-01-26','chargers','ronin bass','',2,700.00,0.00,490.00,420.00,1400.00,29),(15,'2024-01-26','smart watch','ultra watch 8','',1,8000.00,0.00,2100.00,5900.00,8000.00,29),(16,'2024-01-27','speakers','3.1A erorex charger','',2,350.00,0.00,70.00,560.00,700.00,29),(17,'2024-02-06','smart watch','ultra watch 8','',1,8000.00,0.00,2100.00,5900.00,8000.00,29),(18,'2024-02-06','charger','3.1A erorex charger','',2,350.00,0.00,70.00,560.00,700.00,29),(19,'2024-02-11','smart watch','ultra watch 8','',1,8000.00,0.00,2100.00,5900.00,8000.00,29),(20,'2024-02-11','cable','Huawei Type-C Cable','',1,220.00,0.00,40.00,180.00,220.00,29),(21,'2024-02-11','speaker','audionic','',1,2000.00,0.00,0.00,2000.00,2000.00,29),(22,'2024-02-11','connectors','Iphone Connector','',1,450.00,0.00,180.00,270.00,450.00,29),(23,'2024-02-24','adaptors','audionic','',1,2000.00,0.00,0.00,2000.00,2000.00,29),(24,'2024-02-24','smart watch','ultra watch 8','',1,8000.00,0.00,2100.00,5900.00,8000.00,29),(25,'2024-02-24','speaker','Xiaomi USB-C Cable','',1,12.00,0.00,0.00,12.00,12.00,29),(26,'2024-02-24','smart watch','ultra watch 8','',1,8000.00,0.00,2100.00,5900.00,8000.00,29),(27,'2024-02-24','handfree','erorex handfree','',1,2000.00,0.00,0.00,2000.00,2000.00,29),(28,'2024-02-24','cable','iphone cabe local','',1,300.00,0.00,70.00,230.00,300.00,29),(29,'2024-02-24','cable','Huawei Type-C Cable','',1,220.00,0.00,40.00,180.00,220.00,29),(30,'2024-02-24','cable','Infinix Charger Cable','',1,10.00,0.00,0.00,10.00,10.00,29),(31,'2024-02-24','connectors','type-c','',1,300.00,0.00,110.00,190.00,300.00,29),(32,'2024-02-24','connectors','type-c','',1,300.00,0.00,110.00,190.00,300.00,29),(33,'2024-02-24','connectors','type-c','',1,300.00,0.00,110.00,190.00,300.00,29),(34,'2024-02-24','speaker','KTS-1057','',2,1500.00,0.00,650.00,1700.00,3000.00,29),(35,'2024-02-24','speaker','KTS-1057','',3,1500.00,0.00,650.00,2550.00,4500.00,29),(36,'2024-02-24','speaker','KTS-1057','',1,1500.00,0.00,650.00,850.00,1500.00,29),(37,'2024-02-24','speaker','jbl chota speaker','',1,1300.00,0.00,600.00,700.00,1300.00,29),(38,'2024-02-24','DefaultCategory','jbl chota speaker','',1,0.00,0.00,0.00,0.00,0.00,29),(39,'2024-02-24','charger','3.1A charger','',1,300.00,0.00,0.00,300.00,300.00,29),(40,'2024-02-25','Power Bank','Sy186','',1,3000.00,0.00,1100.00,1900.00,3000.00,29),(41,'2024-02-25','charger','3.1A charger','',1,300.00,0.00,0.00,300.00,300.00,29),(42,'2024-02-25','handfree','ronin bass','',1,700.00,0.00,490.00,210.00,700.00,29),(43,'2024-02-25','Glass Protector','OG glass','',1,400.00,0.00,100.00,300.00,400.00,29),(44,'2024-02-25','charger','3.1A charger','',1,300.00,0.00,0.00,300.00,300.00,29),(45,'2024-02-25','Glass Protector','9d','',2,200.00,0.00,40.00,320.00,400.00,29),(46,'2024-02-25','Glass Protector','9d','',1,200.00,0.00,40.00,160.00,200.00,29),(47,'2024-02-25','Glass Protector','9d','',1,200.00,0.00,40.00,160.00,200.00,29),(48,'2024-02-26','Mobiles','Redmi Note 8','',1,150.00,0.00,0.00,150.00,150.00,29),(49,'2024-02-26','Mobiles','samsung s24 ultra','',1,329000.00,0.00,322000.00,7000.00,329000.00,29),(50,'2024-02-26','Mobiles','samsung s24 ultra','',1,329000.00,0.00,322000.00,7000.00,329000.00,29),(51,'2024-02-26','Mobiles','samsung s24 ultra','',1,329000.00,0.00,322000.00,7000.00,329000.00,29),(52,'2024-02-26','Mobiles','samsung s24 ultra','',1,329000.00,0.00,322000.00,7000.00,329000.00,29),(53,'2024-02-26','adaptors','samsung s24 ultra','',1,329000.00,0.00,322000.00,7000.00,329000.00,29),(54,'2024-02-26','covers','vip good','',1,200.00,0.00,70.00,130.00,200.00,29),(55,'2024-02-26','covers','vip good','',1,200.00,0.00,70.00,130.00,200.00,29),(56,'2024-02-26','Power Bank','erorex','',1,3000.00,0.00,1700.00,1300.00,3000.00,29),(57,'2024-03-08','cable','erorex 2.1A','',1,300.00,0.00,140.00,160.00,300.00,29),(58,'2024-03-08','cable','erorex 2.1A','',2,300.00,0.00,140.00,320.00,600.00,29),(59,'2024-06-03','speaker','audionic','',1,2000.00,0.00,0.00,2000.00,2000.00,29),(60,'2024-10-07','speaker','Samsung Galaxy S21','',1,6200.00,0.00,1700.00,4500.00,6200.00,29),(61,'2024-10-08','handfree','Redmi Note 8','',3,150.00,0.00,0.00,450.00,450.00,29),(62,'2024-10-08','charger','Redmi Note 8','',3,150.00,0.00,0.00,450.00,450.00,29),(63,'2024-10-08','handfree','Samsung Galaxy S21','',14,6200.00,0.00,1700.00,63000.00,86800.00,29),(64,'2023-12-30','Mobiles','Huawei Type-C Cable','',2,15.00,0.00,0.00,30.00,30.00,29),(65,'2023-12-30','Mobiles','Huawei Type-C Cable','',2,15.00,0.00,0.00,30.00,30.00,29),(66,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(67,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(68,'2023-12-31','Mobiles','Huawei Type-C Cable','',4,15.00,0.00,0.00,60.00,60.00,29),(69,'2024-10-08','connectors','Redmi Note 8','',3,150.00,0.00,0.00,450.00,450.00,29),(70,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(71,'2023-12-31','cable','','',14,8.00,0.00,0.00,112.00,112.00,29),(72,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(73,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(74,'2023-12-31','cable','Infinix Hot 10','',16,250.00,0.00,0.00,4000.00,4000.00,29),(75,'2024-10-26','connectors','3.1A erorex charger','',2,350.00,0.00,70.00,560.00,700.00,29),(78,'2024-11-19','handfree','erorex handfree','',1,2000.00,0.00,0.00,2000.00,2000.00,29),(80,'2024-12-22','Power Bank','Sy186','40162',1,3000.00,0.00,1100.00,1900.00,3000.00,29),(82,'2024-12-25','handfree','erorex handfree','61249',2,2000.00,0.00,0.00,4000.00,4000.00,29),(83,'2025-01-12','Handfrees','Erorex M22','28729',1,300.00,0.00,140.00,160.00,300.00,32),(84,'2025-01-12','Handfrees','Erorex M22','28729',1,300.00,0.00,140.00,160.00,300.00,32),(85,'2025-01-09','Cables','Huawei 3A cable','33510',5,200.00,0.00,60.00,700.00,1000.00,32),(87,'2025-01-13','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(88,'2025-01-13','Cables','Ronin 2A','67066',2,700.00,0.00,250.00,900.00,1400.00,32),(89,'2025-01-13','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(90,'2025-01-13','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(91,'2025-01-13','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(92,'2025-01-13','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(95,'2025-01-14','Mobiles','Iphone 13 pro max','62963',1,135000.00,0.00,127000.00,8000.00,135000.00,32),(96,'2025-01-13','Handfrees','Erorex M22','28729',3,300.00,30.00,140.00,390.00,810.00,32),(97,'2025-01-14','Cables','Huawei 3A cable','33510',1,200.00,30.00,60.00,110.00,170.00,32),(98,'2025-01-14','Handfrees','Erorex M22','28729',1,300.00,50.00,140.00,110.00,250.00,32),(99,'2025-01-14','Cables','Huawei 3A cable','33510',1,200.00,40.00,60.00,100.00,160.00,32),(100,'2025-01-14','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(101,'2025-01-14','Cables','Huawei 3A cable','33510',1,200.00,0.00,60.00,140.00,200.00,32),(103,'2025-01-15','Handfrees','Erorex M22','28729',1,300.00,30.00,140.00,160.00,300.00,32),(104,'2025-01-15','Cables','Huawei 3A cable','33510',1,200.00,0.00,60.00,140.00,200.00,32),(105,'2025-01-15','Cables','Huawei 3A cable','33510',1,200.00,0.00,60.00,140.00,200.00,32),(106,'2025-01-15','Cables','Huawei 3A cable','33510',1,200.00,0.00,60.00,140.00,200.00,32),(107,'2025-01-15','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(108,'2025-01-15','Cables','Huawei 3A cable','33510',2,200.00,0.00,60.00,280.00,400.00,32),(109,'2025-01-15','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(110,'2025-01-15','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(111,'2025-01-15','Handfrees','Erorex M22','28729',2,300.00,0.00,140.00,320.00,600.00,32),(112,'2025-01-15','Cables','Ronin 2A','67066',1,700.00,0.00,250.00,450.00,700.00,32),(113,'2025-01-15','Handfrees','Erorex M22','28729',1,300.00,0.00,140.00,160.00,300.00,32),(114,'2025-01-15','Cables','Huawei 3A cable','33510',1,200.00,0.00,60.00,140.00,200.00,32),(115,'2025-01-15','Handfrees','Erorex M22','28729',1,300.00,0.00,140.00,160.00,300.00,32),(116,'2025-01-15','Cables','Huawei 3A cable','33510',1,200.00,0.00,60.00,140.00,200.00,32),(117,'2025-01-15','Handfrees','Erorex M22','28729',1,300.00,0.00,140.00,160.00,300.00,32),(118,'2025-01-15','Handfree','erorex handfree','61249',1,2000.00,0.00,0.00,2000.00,2000.00,27),(119,'2025-01-15','Handfree','Erorex M22','32948',1,300.00,0.00,140.00,160.00,300.00,27),(120,'2025-01-14','Handfree','erorex handfree','61249',2,2000.00,0.00,0.00,4000.00,4000.00,27),(121,'2025-01-21','Handfree','Erorex M22','32948',1,300.00,0.00,140.00,160.00,300.00,27),(124,'2025-01-21','Handfree','Erorex M22','32948',2,300.00,0.00,140.00,320.00,600.00,27),(128,'2025-01-21','Handfree','Erorex M22','32948',2,300.00,0.00,140.00,320.00,600.00,27),(130,'2025-01-21','Mobiles','Redmi 13C','65946',1,33000.00,0.00,31000.00,2000.00,33000.00,27),(134,'2025-01-21','Cables','Huawei 3A','59492',2,300.00,0.00,70.00,460.00,600.00,27),(135,'2025-01-21','Cables','Huawei 3A','59492',7,300.00,0.00,70.00,1610.00,2100.00,27),(137,'2025-01-22','Cables','Huawei 3A','59492',1,300.00,0.00,70.00,230.00,300.00,27),(138,'2025-01-22','Cables','Huawei 3A','59492',1,300.00,30.00,70.00,230.00,300.00,27),(139,'2025-01-21','Cables','Huawei 3A','59492',1,300.00,0.00,70.00,230.00,300.00,27);
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`),
  KEY `expires_idx` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('NxwS3pdAD-Ht9jHKclz8eIolv4ONs6cH',1736693947,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-01-12T10:47:03.572Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":32,\"name\":\"Asad masood\",\"username\":\"asad07\",\"email\":\"asadmasood435@gmail.com\",\"isAdmin\":false}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_address` text NOT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_suppliers_user` (`user_id`),
  CONSTRAINT `fk_suppliers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (78,'abdul wahab','house 85','03305000247',29),(79,'hanan','tibbi bangla','0330528926',29),(80,'nadeem','dhmkhaal','02312154212',29),(82,'abdul hanan','shop#5,street#02,alnafay 3.','03368880020',29),(83,'ibrahim khan','raja bazaar imperial 3rd floor','03311234567',29),(84,'fancy traders','shop 5, pwd main market','03331456789',29),(85,'abdul wahab','house 85','03305000247',29),(86,'Danish Ali','Cust university','03311236547',29),(87,'Abdul Wahab','Shop 5, Police foundation','03305000247',27),(90,'Abdul Wahab','police foundation','03355000247',32),(91,'Abdul Wahab','police foundation islamabad','03355000247',32),(92,'Abdul Wahab','police foundation islamabad PWD','03305000247',32),(94,'Abdul Wahab','street 1 A','03305000247',27),(95,'Abdul Wahab','National housing scheme 1 near masjid gulzar e madina tayyab street lane#5 street#2 adiyala road rawalpindi','03332863920',27),(96,'Abdul Wahab','House 53','03305000247',27);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `total_sales`
--

DROP TABLE IF EXISTS `total_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `total_sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `total_sales`
--

LOCK TABLES `total_sales` WRITE;
/*!40000 ALTER TABLE `total_sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `total_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `username` varchar(50) NOT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_users_is_admin` (`is_admin`),
  KEY `idx_users_created_by` (`created_by`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'alisha','aleeshaafreen006@gmail.com','+923345465851','aleeshaafreen006@gmail.com',NULL,0,NULL,'$2b$10$Xu.u0IVI0C6tfK4alHp4IOzt3rlHsGtVbJOWzoO.glPd4p0CiCB1e',NULL,NULL),(3,'abdul hanan','abdulhanan@gmail.com','+923368880020','abdulhanan@gmail.com',NULL,0,NULL,'$2b$10$eBytD/SKrfGFTPndQdVLW.czq0Y2LSYQBCoavHLoEyuRaXzL/zb3u',NULL,NULL),(4,'bareera','bareera123@gmail.com','+923332863920','bareera123',NULL,0,NULL,'$2b$10$QU7j.EeK0VJFF8lKXu1zkOSGDV8YIbpdCoCOtVFdWNHqhZ4udCKBG',NULL,NULL),(7,'abdul ghaffar','abdulghaffar@gmail.com','+923345465851','ghaffar01',NULL,0,NULL,'$2b$10$2jdJsEbZlmI7Kxgqr36FxeiB2x/cIAlwNAbg4sP.j9HcZ8E8kdbA.',NULL,NULL),(8,'alisha afreen','alishaafreen006@gmail.com','+923325809703','alisha1',NULL,0,NULL,'$2b$10$oDHXPr7NUCvmPs//xsVnSO01uCY3MkUXUcNSnpSQmhPrGOYw9qCly',NULL,NULL),(9,'abdullah','abdullah@gmail.com','+923368889968','abdullah2',NULL,0,NULL,'$2b$10$pO4vIx2m3Duomlf/Sgw6nOBc3JsO/T6f5VsbzUq1ZnXpkvX4Acsx6',NULL,NULL),(10,'m mohsin','mohisn@gmail.com','cjbcjskclanc','mohsin123',NULL,0,NULL,'$2b$10$230WKGgYZvDKkq35e43DFuI7L9oUB7Pv1MIHm.tcTJC3AUteLFPcm',NULL,NULL),(11,'babar','babar@gmail.com','03311234567','babar',NULL,0,NULL,'$2b$10$vlNSgoich9IiR2ykCq6TZO17FtcHRJ/0sa4Ds/Jmt.A6DZ7lesoym',NULL,NULL),(12,'huma sheraz','huma@gmail.com','03311234568','humma',NULL,0,NULL,'$2b$10$3wgJy.hCpaNTuOok7xuYkeeophQaWLhdxM9hMF1o2yb2Wrf5SYGWW',NULL,NULL),(13,'wahab','abdulwahab@gmail.com','+923305000247','vksbjs',NULL,0,NULL,'$2b$10$i9Rm9QZShLX6G5vYHVoIrudcvMQecGQQoZyzpjDJo3YuTF6W2JurK',NULL,NULL),(15,'nadeem','nadeem1@gmail.com','03345465951','nadeem123',NULL,0,NULL,'$2b$10$U72hv1Lgtpa/ySgfnr6p3.kraBuElrNnNoPqMBi..DuHEnHmGPdQm',NULL,NULL),(16,'abdul hanan','honey123@gmail.com','03368880020','honey123',NULL,0,NULL,'$2b$10$qtyrApKb5FMK3msbDI9K0.ICWiWgiDPva7AzcbdhX2u/fOvFEtvUe',NULL,NULL),(17,'danial','danialumer876@gmail.com','03363361129','danial',NULL,0,NULL,'$2b$10$UvCxAnKbqrkQELQH3SDnCuiNqG8qKXcE8FOJ3190ww9vDvpnHCyJy',NULL,NULL),(18,'ahsan khaliq','ahsankhaliq88@gmail.com','03065816928','ahsan123',NULL,0,NULL,'$2b$10$GqXqHmoEmr4eR40u3HWOn.N5UzrbmnRoeCkbjRwCL25649TDDl7Oi',NULL,NULL),(19,'talat habiba','talathabiba123@gmail.com','03368880050','talat12',NULL,0,NULL,'$2b$10$Qt9jPr8huYMqcQCCwIXN4elZcVbePH/qr.o200Yyol.JusmqZMVTq',NULL,NULL),(20,'Muhammad Nadeem','muhammadnadeemali286@gmail.com','03405869009','nadeem99',NULL,0,NULL,'$2b$10$HHhg5//.r4IPSh5wbJY8R.jx1sEFqM.KOwOQWlALRGw/QWC7IKbHC','9d426b2b-0ea0-4af5-9210-1636520d89b7',NULL),(22,'danial umer','anyonepk1@gmail.com','03363361129','danial876',NULL,0,NULL,'$2b$10$ZVcgrdTZ8z3rSd7aSBOGRe/BjpvEpVq4vb44Ly1VzHB4OQoxGn2sC',NULL,NULL),(23,'danish Ali','danishnadeem474@gmail.com','03311236547','danish123',NULL,0,NULL,'$2b$10$i4T1OAT/frWrd2Hmp6ar3O4OcxuPi7BllsJCj8x2SyNBz9U4ozAT.','1e14b519-4a7a-443f-b86d-5a162016015c',NULL),(24,'Danish Nadeem','danishnadeem475@gmail.com','03301234567','dan865',NULL,0,NULL,'$2b$10$LHXcgtYr9Wl6XhVO9h4ZF.NQDHMxPYBhvxmuiCOljL2NlPkG3/Smy',NULL,NULL),(25,'Daniyal Sikandar','daniyalch2@gmail.com','03135389531','daniyal123',NULL,0,NULL,'$2b$10$eDWifyEm2e0fjxZh2L4nq..PhxBLlKIbyio01w2t.4qJDj7lZY7J2',NULL,NULL),(26,'UBAID ULLAH AKHTAR','akhtarubaidullah75@gmail.com','03038152415','ubaid112233',NULL,0,NULL,'$2b$10$FFUFvu6Z.GStauq/bgbJsuUijSMalhir7hX5ox82Bdp/uC61IxcBG',NULL,NULL),(27,'Abdul Wahab','shami123@gmail.com','03305000247','shami123',NULL,0,NULL,'$2b$10$w/BWO/JlSpozeiCXVfmeuOy.oVMDFXJ7XBsmbrQkN8b5xlt3k145C',NULL,NULL),(28,'Muhammad Sikander Abbass','sikanderabbas456@gmail.com','03311239874','sikander32',NULL,0,NULL,'$2b$10$rVjsFhvpM8hMfLX2uHr2D.zhsY.K4VsWslBm8ec5Ol8/rR3spqzQS',NULL,NULL),(29,'Admin User','admin@example.com','1234567890','admin',NULL,1,NULL,'$2b$10$YourHashedPasswordHere',NULL,NULL),(31,'Abdul Wahab','abdulwahab01567@gmail.com','03305000247','abdul008',NULL,1,NULL,'$2b$10$eDSJkq56gxhDLTyfJ7hWUOEvJHV1dL7LQmSmX1C9bHoN4WRfOXZ5K',NULL,NULL),(32,'Asad masood','asadmasood435@gmail.com','03332863920','asad07',NULL,0,NULL,'$2b$10$gDzKPNlmZa.JPldGOTWGJerBTz2znsi/acGxXxq6UFhVRWcSc0YSC',NULL,NULL),(33,'umair','umairmakhdoom28@gmail.com','03465363669','umair29',NULL,0,NULL,'$2b$10$Q9VquhNfETOzzrfVgZYuUOS/1eDVHLR/MtnA8TNlgdxVf3SnzmI9u',NULL,NULL),(34,'Mian','mianusama123@gmail.com','03305000249','mian',NULL,0,NULL,'$2b$10$Wo5f3uq0H/cJMqQ9yjj2BO9Y5Ov/Sa7nw1MKRAAwJLE7VStN9H.qm',NULL,NULL),(35,'hafiz mobiles','ubaid123@gmail.com','03332863921','hafiz',NULL,0,NULL,'$2b$10$b/wk4vjcT5NxeBQrBgVvNeMQmXdPJQEwdFdLC1ZpFqiPnjgY3vzqK',NULL,NULL),(36,'hanan mobiles','hananch@gmail.com','03305000149','hanan12',NULL,0,NULL,'$2b$10$EjW7L0zG7jyMa6soC02KPuHqNk5yZ8D92MlSiKRA.Ete/NGi.R0xy',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-12  4:41:10
