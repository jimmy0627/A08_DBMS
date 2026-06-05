CREATE DATABASE  IF NOT EXISTS `arkwikidatabase` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `arkwikidatabase`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: arkwikidatabase
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `user_id` int NOT NULL COMMENT 'FK 參考 User.user_id',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guide_comment`
--

DROP TABLE IF EXISTS `guide_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guide_comment` (
  `guide_id` int NOT NULL COMMENT 'FK 參考 Guide',
  `user_id` int NOT NULL,
  `comment_text` varchar(255) NOT NULL COMMENT '留言內容',
  PRIMARY KEY (`guide_id`,`comment_text`),
  KEY `fk_comment_user` (`user_id`),
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `reg_user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `guide_comment_ibfk_1` FOREIGN KEY (`guide_id`) REFERENCES `guides` (`guide_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guide_comment`
--

LOCK TABLES `guide_comment` WRITE;
/*!40000 ALTER TABLE `guide_comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `guide_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guides`
--

DROP TABLE IF EXISTS `guides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guides` (
  `guide_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `stage_id` varchar(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`guide_id`),
  KEY `stage_id` (`stage_id`),
  KEY `fk_guides_user` (`user_id`),
  CONSTRAINT `fk_guides_user` FOREIGN KEY (`user_id`) REFERENCES `reg_user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `guides_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`stage_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guides`
--

LOCK TABLES `guides` WRITE;
/*!40000 ALTER TABLE `guides` DISABLE KEYS */;
INSERT INTO `guides` VALUES (2,2,'JT8-2','JT8-2 塔露拉機制解析','注意黑蛇的點燃機制，必須帶上群補醫療與快速復活幹員騙點燃。','2026-05-09 13:05:58'),(4,1,'1-7','Postman 測試攻略發布','這是我用 Postman 成功寫入 MySQL 的第一篇攻略！','2026-05-09 13:51:49'),(5,1,'1-7','Postman 測試攻略發布','這是我用 Postman 成功寫入 MySQL 的第一篇攻略！','2026-05-09 13:52:25'),(6,1,'1-7','1-7 固源岩無限刷法','帶上單核心幹員，其餘放信賴隊即可，建議使用能天使或煌。','2026-05-10 05:24:48'),(7,1,'JT8-2','JT8-2 塔露拉機制解析','注意黑蛇的點燃機制，必須帶上群補醫療與快速復活幹員騙點燃。','2026-05-10 05:24:48'),(8,2,'4-4','4-4 弒君者逃課法','特種幹員的勝利！使用阿消或暗索，把弒君者推拉進坑裡直接秒殺。','2026-05-10 05:24:48'),(9,1,'1-7','Postman 整合測試','確認 Django 與 MySQL 串接成功。','2026-05-10 06:00:38'),(10,1,'1-7','Postman 整合測試','Django 串接成功，六大幹員資料就緒！','2026-06-02 17:15:18'),(11,1,'1-7','Postman 整合測試','Django 串接成功，六大幹員資料就緒！','2026-06-02 17:15:28');
/*!40000 ALTER TABLE `guides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material` (
  `material_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`material_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material`
--

LOCK TABLES `material` WRITE;
/*!40000 ALTER TABLE `material` DISABLE KEYS */;
INSERT INTO `material` VALUES (1,'D32鋼','/static/images/materials/d32_steel.png'),(2,'聚合劑','/static/images/materials/polymerization_preparation.png'),(3,'雙極納米片',NULL),(4,'晶體電子單元',NULL),(5,'燒結核凝晶',NULL),(6,'轉質鹽聚塊',NULL),(7,'晶耀磁環',NULL),(8,'提純源岩',NULL),(9,'糖聚塊','/static/images/materials/sugar_lump.png'),(10,'聚酸酯塊',NULL),(11,'異鐵塊',NULL),(12,'酮陣列',NULL),(13,'改量裝置','/static/images/materials/optimized_device.png'),(14,'白馬醇','/static/images/materials/white_horse_kohl.png'),(15,'三水錳礦','/static/images/materials/rma70_24.png'),(16,'五水研磨石',NULL),(17,'RMA70-24',NULL),(18,'聚合凝膠','/static/images/materials/polymerized_gel.png'),(19,'熾合金塊',NULL),(20,'晶體電路',NULL),(21,'精煉溶劑',NULL),(22,'切削原液',NULL),(23,'固化纖維板',NULL),(24,'環己沙酮',NULL),(25,'固源岩組','/static/images/materials/orirock_cube.png'),(26,'糖組','/static/images/materials/sugar_pack.png'),(27,'聚酸酯組','/static/images/materials/polyester_pack.png'),(28,'異鐵組',NULL),(29,'酮凝集組',NULL),(30,'全新裝置',NULL),(31,'扭轉醇','/static/images/materials/loxic_kohl.png'),(32,'輕錳礦',NULL),(33,'研磨石',NULL),(34,'RMA70-12',NULL),(35,'凝膠',NULL),(36,'熾合金',NULL),(37,'晶體元件',NULL),(38,'半自然溶劑',NULL),(39,'化合切削液',NULL),(40,'褐素纖維',NULL),(41,'轉質鹽組',NULL),(42,'固源岩','/static/images/materials/orirock.png'),(43,'糖','/static/images/materials/sugar.png'),(44,'聚酸酯','/static/images/materials/polyester.png'),(45,'異鐵','/static/images/materials/oriron.png'),(46,'酮凝集','/static/images/materials/polyketon.png'),(47,'裝置','/static/images/materials/device.png'),(48,'源岩',NULL),(49,'代糖',NULL),(50,'酯原料',NULL),(51,'異鐵碎片',NULL),(52,'雙酮',NULL),(53,'破損裝置',NULL),(54,'技巧概要·卷1',NULL),(55,'技巧概要·卷2',NULL),(56,'技巧概要·卷3',NULL);
/*!40000 ALTER TABLE `material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `module_id` int NOT NULL AUTO_INCREMENT COMMENT '模組唯一識別碼',
  `name` varchar(100) NOT NULL,
  `operator_id` int NOT NULL COMMENT 'FK 參考 Operator',
  `unlock_mission` text COMMENT '解鎖任務條件',
  `module_type` char(1) NOT NULL COMMENT '標示 X/Y/D 模組',
  `icon_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`module_id`),
  UNIQUE KEY `operator_id` (`operator_id`,`module_type`),
  CONSTRAINT `module_ibfk_1` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=291 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES (1,'喀蘭之威',4,'戰鬥中累積使用真銀斬造成 50000 點傷害。','X','/static/images/modules/silverash_x.png'),(2,'天使的餽贈',1,'在主線 2-8 中，使用能天使擊敗至少 10 個敵人。','X','/static/images/modules/exusiai_x.png'),(3,'火山學者的行囊',17,'在主線 4-8 中，使用艾雅法拉累計造成 20000 點法術傷害。','Y','/static/images/modules/eyjafjalla_y.png'),(4,'史爾特爾的記憶碎片',29,'戰鬥中累計使用黃昏擊敗 20 個菁英敵人。','X','/static/images/modules/surtr_x.png'),(5,'伊比利亞的劍術手稿',27,'在主線 6-5 中，使用棘刺累計發動 10 次至高之術。','X','/static/images/modules/thorns_x.png'),(6,'羅德島制式鏈鋸改裝件',11,'在主線 5-10 中，使用煌承受累計 10000 點傷害並存活。','X','/static/images/modules/blaze_x.png');
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_material`
--

DROP TABLE IF EXISTS `module_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_material` (
  `module_id` int NOT NULL COMMENT 'FK 參考 Module',
  `level` int NOT NULL,
  `material_id` int NOT NULL COMMENT 'FK 參考 Material',
  `amount` int NOT NULL COMMENT '需求素材數量',
  PRIMARY KEY (`module_id`,`level`,`material_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `module_material_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`) ON DELETE CASCADE,
  CONSTRAINT `module_material_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `material` (`material_id`) ON DELETE CASCADE,
  CONSTRAINT `module_material_chk_1` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_material`
--

LOCK TABLES `module_material` WRITE;
/*!40000 ALTER TABLE `module_material` DISABLE KEYS */;
INSERT INTO `module_material` VALUES (1,1,2,2),(1,2,3,3),(1,3,1,20),(1,3,2,4),(2,1,3,2),(2,2,2,3),(2,3,1,20),(2,3,3,4),(3,1,2,2),(3,2,3,3),(3,3,1,20),(3,3,2,4),(4,1,3,2),(4,2,2,3),(4,3,1,20),(4,3,3,4),(5,1,2,2),(5,2,3,3),(5,3,1,20),(5,3,2,4),(6,1,3,2),(6,2,2,3),(6,3,1,20),(6,3,3,4);
/*!40000 ALTER TABLE `module_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `op_material`
--

DROP TABLE IF EXISTS `op_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `op_material` (
  `operator_id` int NOT NULL,
  `material_id` int NOT NULL,
  `elite_stage` int NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`operator_id`,`material_id`,`elite_stage`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `op_material_ibfk_1` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE,
  CONSTRAINT `op_material_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `material` (`material_id`) ON DELETE CASCADE,
  CONSTRAINT `op_material_chk_1` CHECK ((`elite_stage` in (1,2))),
  CONSTRAINT `op_material_chk_2` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `op_material`
--

LOCK TABLES `op_material` WRITE;
/*!40000 ALTER TABLE `op_material` DISABLE KEYS */;
INSERT INTO `op_material` VALUES (1,2,2,4),(1,9,2,5),(1,42,1,12),(1,43,1,5),(4,1,2,4),(4,14,2,6),(4,42,1,12),(4,46,1,4),(11,1,2,4),(11,13,2,5),(11,25,1,12),(11,26,1,5),(17,2,2,4),(17,31,2,5),(17,42,1,12),(17,45,1,5),(27,1,2,4),(27,15,2,6),(27,25,1,12),(27,27,1,5),(29,1,2,4),(29,18,2,7),(29,44,1,5),(29,47,1,4);
/*!40000 ALTER TABLE `op_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `op_state`
--

DROP TABLE IF EXISTS `op_state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `op_state` (
  `operator_id` int NOT NULL,
  `elite_stage` int NOT NULL COMMENT '精英化階段 (0, 1, 2)',
  `max_level` int NOT NULL COMMENT '該階段的等級上限',
  `min_hp` int NOT NULL,
  `max_hp` int NOT NULL,
  `min_atk` int NOT NULL,
  `max_atk` int NOT NULL,
  `min_def` int NOT NULL,
  `max_def` int NOT NULL,
  `min_res` int NOT NULL,
  `max_res` int NOT NULL,
  PRIMARY KEY (`operator_id`,`elite_stage`),
  CONSTRAINT `op_state_ibfk_1` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `op_state`
--

LOCK TABLES `op_state` WRITE;
/*!40000 ALTER TABLE `op_state` DISABLE KEYS */;
INSERT INTO `op_state` VALUES (1,0,50,735,1051,217,345,57,85,0,0),(1,1,80,1051,1383,345,480,85,126,0,0),(1,2,90,1483,1670,480,540,126,161,0,0),(4,0,50,1043,1491,333,476,174,249,10,10),(4,1,80,1491,1937,476,644,249,333,10,10),(4,2,90,2039,2560,670,763,355,397,10,10),(11,0,50,1222,1675,279,405,137,194,0,0),(11,1,80,1675,2205,405,588,194,270,0,0),(11,2,90,2205,2827,588,765,270,351,0,0),(17,0,50,748,1039,311,445,46,64,10,10),(17,1,80,1039,1350,445,610,64,92,15,15),(17,2,90,1450,1743,610,735,92,122,20,20),(27,0,50,1060,1453,306,438,175,251,10,10),(27,1,80,1453,1888,438,593,251,335,10,10),(27,2,90,1988,2612,593,711,335,402,10,10),(29,0,50,1195,1637,289,414,158,226,15,15),(29,1,80,1637,2213,414,576,226,323,15,15),(29,2,90,2313,2916,576,711,323,414,15,15);
/*!40000 ALTER TABLE `op_state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `op_tag`
--

DROP TABLE IF EXISTS `op_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `op_tag` (
  `operator_id` int NOT NULL COMMENT 'FK 參考 Operator',
  `tag_name` varchar(20) NOT NULL COMMENT '招募標籤',
  PRIMARY KEY (`operator_id`,`tag_name`),
  CONSTRAINT `op_tag_ibfk_1` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `op_tag`
--

LOCK TABLES `op_tag` WRITE;
/*!40000 ALTER TABLE `op_tag` DISABLE KEYS */;
INSERT INTO `op_tag` VALUES (1,'輸出'),(1,'遠程位'),(4,'支援'),(4,'輸出'),(4,'近戰位'),(11,'生存'),(11,'輸出'),(11,'近戰位'),(17,'削弱'),(17,'輸出'),(17,'遠程位'),(27,'輸出'),(27,'近戰位'),(27,'防護'),(29,'生存'),(29,'輸出'),(29,'近戰位');
/*!40000 ALTER TABLE `op_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operator`
--

DROP TABLE IF EXISTS `operator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operator` (
  `operator_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `rarity` int NOT NULL,
  `class` enum('先鋒','近衛','重裝','狙擊','術師','輔助','特種','醫療') NOT NULL,
  `branch` varchar(30) NOT NULL,
  `position` enum('近戰位','遠程位') NOT NULL,
  `sex` enum('男','女','無') NOT NULL,
  PRIMARY KEY (`operator_id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `operator_chk_1` CHECK ((`rarity` between 1 and 6))
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operator`
--

LOCK TABLES `operator` WRITE;
/*!40000 ALTER TABLE `operator` DISABLE KEYS */;
INSERT INTO `operator` VALUES (1,'能天使',6,'狙擊','速射手','遠程位','女'),(2,'黑',6,'狙擊','重射手','遠程位','女'),(3,'安潔莉娜',6,'輔助','凝滯師','遠程位','女'),(4,'銀灰',6,'近衛','領主','近戰位','男'),(5,'莫斯提馬',6,'術師','擴散術師','遠程位','女'),(6,'夜鶯',6,'醫療','群愈師','遠程位','女'),(7,'星熊',6,'重裝','鐵衛','近戰位','女'),(8,'陳',6,'近衛','劍豪','近戰位','女'),(9,'年',6,'重裝','鐵衛','近戰位','女'),(10,'阿',6,'特種','怪傑','遠程位','男'),(11,'煌',6,'近衛','強攻手','近戰位','女'),(12,'麥哲倫',6,'輔助','召喚師','遠程位','女'),(13,'赫拉格',6,'近衛','武者','近戰位','男'),(14,'斯卡蒂',6,'近衛','無畏者','近戰位','女'),(15,'塞雷婭',6,'重裝','守護者','近戰位','女'),(16,'閃靈',6,'醫療','醫師','遠程位','女'),(17,'艾雅法拉',6,'術師','中堅術師','遠程位','女'),(18,'伊芙利特',6,'術師','轟擊術師','遠程位','女'),(19,'推進之王',6,'先鋒','尖兵','近戰位','女'),(20,'刻俄柏',6,'術師','中堅術師','遠程位','女'),(21,'風笛',6,'先鋒','衝鋒手','近戰位','女'),(22,'傀影',6,'特種','處決者','近戰位','男'),(23,'溫蒂',6,'特種','推擊手','近戰位','女'),(24,'W',6,'狙擊','炮手','遠程位','女'),(25,'早露',6,'狙擊','攻城手','遠程位','女'),(26,'鈴蘭',6,'輔助','凝滯師','遠程位','女'),(27,'棘刺',6,'近衛','領主','近戰位','男'),(28,'森蚺',6,'重裝','決戰者','近戰位','女'),(29,'史爾特爾',6,'近衛','術戰者','近戰位','女'),(30,'瑕光',6,'重裝','守護者','近戰位','女'),(31,'迷迭香',6,'狙擊','投擲手','遠程位','女'),(32,'泥岩',6,'重裝','不屈者','近戰位','女'),(33,'山',6,'近衛','鬥士','近戰位','男'),(34,'空弦',6,'狙擊','速射手','遠程位','女'),(35,'嵯峨',6,'先鋒','尖兵','近戰位','女'),(36,'夕',6,'術師','擴散術師','遠程位','女'),(37,'灰燼',6,'狙擊','速射手','遠程位','女'),(38,'異客',6,'術師','鏈術師','遠程位','男'),(39,'凱爾希',6,'醫療','醫師','遠程位','女'),(40,'歌蕾蒂婭',6,'特種','鉤索師','近戰位','女'),(41,'濁心斯卡蒂',6,'輔助','吟遊者','遠程位','女'),(42,'卡涅利安',6,'術師','陣法術師','遠程位','女'),(43,'帕拉斯',6,'近衛','教官','近戰位','女'),(44,'假日威龍陳',6,'狙擊','散射手','遠程位','女'),(45,'水月',6,'特種','伏擊客','近戰位','男'),(46,'琴柳',6,'先鋒','執旗手','近戰位','女'),(47,'遠牙',6,'狙擊','神射手','遠程位','女'),(48,'耀騎士臨光',6,'近衛','無畏者','近戰位','女'),(49,'焰尾',6,'先鋒','尖兵','近戰位','女'),(50,'鐧',6,'近衛','劍豪','近戰位','女'),(51,'靈知',6,'輔助','削弱者','遠程位','男'),(52,'老鯉',6,'特種','行商','近戰位','男'),(53,'令',6,'輔助','召喚師','遠程位','女'),(54,'澄閃',6,'術師','馭械術師','遠程位','女'),(55,'菲亞梅塔',6,'狙擊','炮手','遠程位','女'),(56,'號角',6,'重裝','要塞','近戰位','女'),(57,'歸溟幽靈鯊',6,'特種','傀儡師','近戰位','女'),(58,'艾麗妮',6,'近衛','劍豪','近戰位','女'),(59,'流明',6,'醫療','療養師','遠程位','男'),(60,'黑鍵',6,'術師','秘術師','遠程位','男'),(61,'多蘿西',6,'特種','陷阱師','遠程位','女'),(62,'百鍊嘉維爾',6,'近衛','強攻手','近戰位','女'),(63,'鴻雪',6,'狙擊','重射手','遠程位','女'),(64,'瑪恩納',6,'近衛','解放者','近戰位','男'),(65,'白鐵',6,'輔助','工匠','近戰位','男'),(66,'緘默德克薩斯',6,'特種','處決者','近戰位','女'),(67,'斥罪',6,'重裝','不屈者','近戰位','女'),(68,'伺夜',6,'先鋒','戰術家','遠程位','男'),(69,'焰影葦草',6,'醫療','咒癒師','遠程位','女'),(70,'重岳',6,'近衛','鬥士','近戰位','男'),(71,'林',6,'術師','陣法術師','遠程位','女'),(72,'仇白',6,'近衛','領主','近戰位','女'),(73,'麒麟R夜刀',6,'特種','處決者','近戰位','女'),(74,'伊內絲',6,'先鋒','情報官','近戰位','女'),(75,'繆爾賽思',6,'先鋒','戰術家','遠程位','女'),(76,'霍爾海雅',6,'術師','中堅術師','遠程位','女'),(77,'淬羽赫默',6,'輔助','護佑者','遠程位','女'),(78,'聖約送葬人',6,'近衛','收割者','近戰位','男'),(79,'提豐',6,'狙擊','攻城手','遠程位','女'),(80,'純燼艾雅法拉',6,'醫療','行醫','遠程位','女'),(81,'琳琅詩懷雅',6,'特種','行商','近戰位','女'),(82,'滌火傑西卡',6,'重裝','哨戒鐵衛','近戰位','女'),(83,'赫德雷',6,'近衛','重劍手','近戰位','男'),(84,'止頌',6,'近衛','無畏者','近戰位','男'),(85,'塑心',6,'輔助','巫役','遠程位','女'),(86,'薇薇安娜',6,'近衛','術戰者','近戰位','女'),(87,'萊伊',6,'狙擊','獵手','遠程位','女'),(88,'黍',6,'重裝','守護者','近戰位','女'),(89,'左樂',6,'近衛','武者','近戰位','男'),(90,'艾拉',6,'特種','陷阱師','遠程位','女'),(91,'阿斯卡綸',6,'特種','伏擊客','近戰位','女'),(92,'維什戴爾',6,'狙擊','投擲手','遠程位','女'),(93,'邏各斯',6,'術師','中堅術師','遠程位','男'),(94,'魔王',6,'輔助','吟遊者','遠程位','女'),(95,'烏爾比安',6,'近衛','重劍手','近戰位','男'),(96,'妮芙',6,'術師','本源術師','遠程位','女'),(97,'佩佩',6,'近衛','撼地者','近戰位','女'),(98,'娜仁圖亞',6,'狙擊','回環射手','遠程位','女'),(99,'瑪露西爾',6,'術師','擴散術師','遠程位','女'),(100,'維娜·維多利亞',6,'近衛','術戰者','近戰位','女');
/*!40000 ALTER TABLE `operator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operator_profile`
--

DROP TABLE IF EXISTS `operator_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operator_profile` (
  `operator_id` int NOT NULL,
  `illustrator` varchar(50) DEFAULT NULL,
  `voice_actor` varchar(50) DEFAULT NULL,
  `lore_text` text,
  PRIMARY KEY (`operator_id`),
  CONSTRAINT `operator_profile_ibfk_1` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operator_profile`
--

LOCK TABLES `operator_profile` WRITE;
/*!40000 ALTER TABLE `operator_profile` DISABLE KEYS */;
INSERT INTO `operator_profile` VALUES (1,'幻象黑兔','石見舞菜香','企鵝物流員工，性格開朗活潑，極度熱愛蘋果派與各種派對，是值得信賴的信使。'),(4,'龍崎一','小西克幸','喀蘭貿易董事長，出身自雪境的貴族，是羅德島的堅實盟友。'),(11,'唯@W','中原麻衣','羅德島精英幹員，為人熱情直爽，擅長使用一把巨大的電鋸，總是在最前線衝鋒陷陣。'),(17,'Anmi','種田梨沙','天才火山學家，雖然深受礦石病折磨導致聽力受損，但依然保持著對學術與生活的熱愛。'),(27,'幻象黑兔','石川界人','伊比利亞出身的劍客，性格冷淡但心思縝密，精通名為「至高之術」的獨特劍法與毒素調配。'),(29,'ASK','堀江由衣','擁有一把名為「萊瓦汀」的雙手大劍，性格孤僻的神秘薩卡茲少女。');
/*!40000 ALTER TABLE `operator_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `own`
--

DROP TABLE IF EXISTS `own`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `own` (
  `user_id` int NOT NULL,
  `operator_id` int NOT NULL,
  `current_elite` int NOT NULL,
  `current_level` int NOT NULL,
  `target_elite` int NOT NULL,
  `target_level` int NOT NULL,
  PRIMARY KEY (`user_id`,`operator_id`),
  KEY `operator_id` (`operator_id`),
  CONSTRAINT `fk_own_user` FOREIGN KEY (`user_id`) REFERENCES `reg_user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `own_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE,
  CONSTRAINT `own_chk_1` CHECK ((`current_elite` between 0 and 2)),
  CONSTRAINT `own_chk_2` CHECK ((`current_level` > 0)),
  CONSTRAINT `own_chk_3` CHECK ((`target_elite` between 0 and 2)),
  CONSTRAINT `own_chk_4` CHECK ((`target_level` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `own`
--

LOCK TABLES `own` WRITE;
/*!40000 ALTER TABLE `own` DISABLE KEYS */;
INSERT INTO `own` VALUES (1,4,2,90,2,90),(1,17,2,60,2,90);
/*!40000 ALTER TABLE `own` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reg_user`
--

DROP TABLE IF EXISTS `reg_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reg_user` (
  `user_id` int NOT NULL COMMENT 'FK 參考 User.user_id',
  `nickname` varchar(50) NOT NULL COMMENT '用戶暱稱',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `nickname` (`nickname`),
  CONSTRAINT `reg_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reg_user`
--

LOCK TABLES `reg_user` WRITE;
/*!40000 ALTER TABLE `reg_user` DISABLE KEYS */;
INSERT INTO `reg_user` VALUES (2,'Amiya_002'),(1,'Doctor_001'),(3,'凱爾希');
/*!40000 ALTER TABLE `reg_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill` (
  `skill_id` int NOT NULL AUTO_INCREMENT,
  `op_id` int NOT NULL,
  `skill_name` varchar(50) NOT NULL,
  `skill_profile` text,
  `icon_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`skill_id`),
  KEY `op_id` (`op_id`),
  CONSTRAINT `skill_ibfk_1` FOREIGN KEY (`op_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill`
--

LOCK TABLES `skill` WRITE;
/*!40000 ALTER TABLE `skill` DISABLE KEYS */;
INSERT INTO `skill` VALUES (1,4,'真銀斬','大幅度擴大攻擊範圍，攻擊力提升，同時攻擊多個目標。','/static/images/skills/silverash_s3.png'),(2,17,'火山','隨機攻擊範圍內多個目標，攻擊力與攻速大幅提升。','/static/images/skills/eyjafjalla_s3.png'),(3,29,'黃昏','立即恢復所有生命值，攻擊範圍、攻擊力與攻擊目標數大幅提升，隨後每秒流失生命。','/static/images/skills/surtr_s3.png'),(4,1,'過載模式','攻擊變為 5 連射，攻擊間隔縮短，自動觸發。','/static/images/skills/exusiai_s3.png'),(5,27,'至高之術','攻擊範圍擴大，攻擊力與攻擊速度提升，第二次使用後持續時間無限','/static/images/skills/thorns_s3.png'),(6,11,'鏈鋸延伸模組','攻擊力與防禦力提升，攻擊距離加長，持續時間無限','/static/images/skills/blaze_s2.png');
/*!40000 ALTER TABLE `skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill_material`
--

DROP TABLE IF EXISTS `skill_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill_material` (
  `skill_id` int NOT NULL,
  `level` int NOT NULL,
  `material_id` int NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`skill_id`,`level`,`material_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `skill_material_ibfk_1` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`) ON DELETE CASCADE,
  CONSTRAINT `skill_material_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `material` (`material_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill_material`
--

LOCK TABLES `skill_material` WRITE;
/*!40000 ALTER TABLE `skill_material` DISABLE KEYS */;
INSERT INTO `skill_material` VALUES (1,8,2,4),(1,9,1,10),(1,9,3,5),(1,10,2,6),(2,8,2,3),(2,9,1,10),(2,9,3,4),(2,10,2,6),(2,10,3,5),(3,8,3,4),(3,9,1,9),(3,9,2,4),(3,10,2,6),(3,10,3,4),(4,8,2,4),(4,8,3,4),(4,9,1,8),(4,9,2,4),(4,9,3,5),(4,10,2,6),(5,8,2,3),(5,9,1,12),(5,9,3,5),(5,10,2,6),(5,10,3,5),(6,8,3,4),(6,9,1,8),(6,9,2,4),(6,10,2,6),(6,10,3,4);
/*!40000 ALTER TABLE `skill_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stage_drop`
--

DROP TABLE IF EXISTS `stage_drop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stage_drop` (
  `stage_id` varchar(20) NOT NULL,
  `material_id` int NOT NULL,
  `drop_rate` enum('固定','大概率','中概率','小概率','罕見') NOT NULL,
  PRIMARY KEY (`stage_id`,`material_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `stage_drop_ibfk_1` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`stage_id`) ON DELETE CASCADE,
  CONSTRAINT `stage_drop_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `material` (`material_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stage_drop`
--

LOCK TABLES `stage_drop` WRITE;
/*!40000 ALTER TABLE `stage_drop` DISABLE KEYS */;
INSERT INTO `stage_drop` VALUES ('1-7',25,'固定'),('1-7',26,'小概率'),('1-7',42,'固定'),('10-6',18,'中概率'),('10-6',21,'大概率'),('4-4',11,'大概率'),('4-4',28,'中概率'),('4-4',31,'大概率'),('7-15',13,'大概率'),('7-15',14,'小概率'),('JT8-2',37,'小概率'),('R8-11',4,'罕見'),('R8-11',20,'小概率');
/*!40000 ALTER TABLE `stage_drop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stages`
--

DROP TABLE IF EXISTS `stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stages` (
  `stage_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `energy_cost` int NOT NULL,
  PRIMARY KEY (`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stages`
--

LOCK TABLES `stages` WRITE;
/*!40000 ALTER TABLE `stages` DISABLE KEYS */;
INSERT INTO `stages` VALUES ('1-7','暴君',6),('10-6','引航者',21),('11-4','枯萎蔓延',21),('4-4','恐慌蔓延',15),('7-15','半死不活',18),('JT8-2','日落之前',21),('R8-11','雪落的晨星',18),('S3-2','記憶流失',15);
/*!40000 ALTER TABLE `stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT '使用者唯一識別碼',
  `email` varchar(100) NOT NULL COMMENT '登入信箱',
  `password_hash` varchar(255) NOT NULL COMMENT '登入密碼',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'doctor@rhodesisland.com','default_pwd'),(2,'amiya@rhodesisland.com','default_pwd'),(3,'kaltsit@rhodesisland.com','ex_wife_password');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 21:49:49
