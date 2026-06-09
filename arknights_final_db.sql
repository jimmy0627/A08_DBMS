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
INSERT INTO `admin` VALUES (1);
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
INSERT INTO `material` VALUES (1,'D32鋼','/static/images/materials/d32_steel.png'),(2,'聚合劑','/static/images/materials/polymerization_preparation.png'),(3,'雙極納米片',NULL),(4,'晶體電子單元',NULL),(5,'燒結核凝晶',NULL),(6,'轉質鹽聚塊',NULL),(7,'晶耀磁環',NULL),(8,'提純源岩',NULL),(9,'糖聚塊','/static/images/materials/sugar_lump.png'),(10,'聚酸酯塊',NULL),(11,'異鐵塊',NULL),(12,'酮陣列',NULL),(13,'改量裝置','/static/images/materials/optimized_device.png'),(14,'白馬醇','/static/images/materials/white_horse_kohl.png'),(15,'三水錳礦','/static/images/materials/rma70_24.png'),(16,'五水研磨石',NULL),(17,'RMA70-24',NULL),(18,'聚合凝膠','/static/images/materials/polymerized_gel.png'),(19,'熾合金塊',NULL),(20,'晶體電路',NULL),(21,'精煉溶劑',NULL),(22,'切削原液',NULL),(23,'固化纖維板',NULL),(24,'環己沙酮',NULL),(25,'固源岩組','/static/images/materials/orirock_cube.png'),(26,'糖組','/static/images/materials/sugar_pack.png'),(27,'聚酸酯組','/static/images/materials/polyester_pack.png'),(28,'異鐵組','/static/images/materials/oriron_cluster.png'),(29,'酮凝集組','/static/images/materials/aketon.png'),(30,'全新裝置','/static/images/materials/brand_new_device.png'),(31,'扭轉醇','/static/images/materials/loxic_kohl.png'),(32,'輕錳礦','/static/images/materials/manganese_ore.png'),(33,'研磨石','/static/images/materials/grindstone.png'),(34,'RMA70-12',NULL),(35,'凝膠',NULL),(36,'熾合金',NULL),(37,'晶體元件',NULL),(38,'半自然溶劑',NULL),(39,'化合切削液',NULL),(40,'褐素纖維',NULL),(41,'轉質鹽組',NULL),(42,'固源岩','/static/images/materials/orirock.png'),(43,'糖','/static/images/materials/sugar.png'),(44,'聚酸酯','/static/images/materials/polyester.png'),(45,'異鐵','/static/images/materials/oriron.png'),(46,'酮凝集','/static/images/materials/polyketon.png'),(47,'裝置','/static/images/materials/device.png'),(48,'源岩','/static/images/materials/rock.png'),(49,'代糖','/static/images/materials/substitute.png'),(50,'酯原料','/static/images/materials/ester.png'),(51,'異鐵碎片','/static/images/materials/oriron_shard.png'),(52,'雙酮','/static/images/materials/diketon.png'),(53,'破損裝置','/static/images/materials/damaged_device.png'),(54,'技巧概要·卷1',NULL),(55,'技巧概要·卷2',NULL),(56,'技巧概要·卷3',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES (1,'喀蘭之威',4,'戰鬥中累積使用真銀斬造成 50000 點傷害。','X','/static/images/modules/silverash_x.png'),(2,'天使的餽贈',1,'在主線 2-8 中，使用能天使擊敗至少 10 個敵人。','X','/static/images/modules/exusiai_x.png'),(3,'火山學者的行囊',17,'在主線 4-8 中，使用艾雅法拉累計造成 20000 點法術傷害。','Y','/static/images/modules/eyjafjalla_y.png'),(4,'史爾特爾的記憶碎片',29,'戰鬥中累計使用黃昏擊敗 20 個菁英敵人。','X','/static/images/modules/surtr_x.png'),(5,'伊比利亞的劍術手稿',27,'在主線 6-5 中，使用棘刺累計發動 10 次至高之術。','X','/static/images/modules/thorns_x.png'),(6,'羅德島制式鏈鋸改裝件',11,'在主線 5-10 中，使用煌承受累計 10000 點傷害並存活。','X','/static/images/modules/blaze_x.png'),(291,'純白旗幟',104,'累計使用桃金娘技能50次','X','/static/images/modules/myrtle_x.png'),(292,'簽名棒球',105,'使用蛇屠箱承受100000點傷害','Y','/static/images/modules/cuora_y.png'),(293,'卡西米爾騎士牌',106,'使用礫抵擋10次致命傷害','X','/static/images/modules/gravel_x.png'),(294,'敘拉古特製雙劍',107,'使用拉普蘭德沉默敵人100次','X','/static/images/modules/lappland_x.png'),(295,'企鵝物流快遞箱',108,'使用德克薩斯劍雨暈眩敵人50次','X','/static/images/modules/texas_x.png'),(296,'深海破裂電鋸',109,'使用幽靈鯊擊敗50名敵人','X','/static/images/modules/specter_x.png');
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
INSERT INTO `op_material` VALUES (1,2,2,4),(1,9,2,5),(1,42,1,12),(1,43,1,5),(4,1,2,4),(4,14,2,6),(4,42,1,12),(4,46,1,4),(11,1,2,4),(11,14,2,7),(11,25,1,12),(11,45,1,5),(17,2,2,4),(17,31,2,5),(17,42,1,12),(17,45,1,5),(27,1,2,4),(27,15,2,6),(27,25,1,12),(27,27,1,5),(29,1,2,4),(29,18,2,7),(29,44,1,5),(29,47,1,4),(101,42,1,10),(101,43,1,3),(102,42,1,4),(102,46,1,3),(103,44,1,3),(103,45,1,3),(104,18,2,6),(104,31,2,10),(104,42,1,15),(104,44,1,5),(105,25,2,14),(105,26,2,10),(105,44,1,3),(105,45,1,3),(106,25,2,14),(106,30,2,8),(106,42,1,5),(106,47,1,2),(107,13,2,4),(107,15,2,6),(107,25,1,6),(107,46,1,4),(108,15,2,6),(108,28,1,4),(108,33,2,11),(108,47,1,3),(109,14,2,7),(109,27,1,5),(109,29,2,15),(109,45,1,4);
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
  `cost` int NOT NULL DEFAULT '0',
  `stop_amount` int NOT NULL DEFAULT '0',
  `deploy_cd` int NOT NULL DEFAULT '0',
  `atk_cd` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`operator_id`,`elite_stage`),
  CONSTRAINT `op_state_ibfk_1` FOREIGN KEY (`operator_id`) REFERENCES `operator` (`operator_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `op_state`
--

LOCK TABLES `op_state` WRITE;
/*!40000 ALTER TABLE `op_state` DISABLE KEYS */;
INSERT INTO `op_state` VALUES (1,0,50,735,1051,217,345,57,85,0,0,12,1,70,1),(1,1,80,1051,1383,345,480,85,126,0,0,14,1,70,1),(1,2,90,1483,1670,480,540,126,161,0,0,14,1,70,1),(4,0,50,1043,1491,333,476,174,249,10,10,18,2,70,1.3),(4,1,80,1491,1937,476,644,249,333,10,10,20,2,70,1.3),(4,2,90,2039,2560,670,763,355,397,10,10,20,2,70,1.3),(11,0,50,1222,1675,279,405,137,194,0,0,22,2,70,1.2),(11,1,80,1675,2205,405,588,194,270,0,0,24,2,70,1.2),(11,2,90,2205,2827,588,765,270,351,0,0,24,3,70,1.2),(17,0,50,748,1039,311,445,46,64,10,10,19,1,70,1.6),(17,1,80,1039,1350,445,610,64,92,15,15,21,1,70,1.6),(17,2,90,1450,1743,610,735,92,122,20,20,21,1,70,1.6),(27,0,50,1060,1453,306,438,175,251,10,10,18,2,70,1.3),(27,1,80,1453,1888,438,593,251,335,10,10,20,2,70,1.3),(27,2,90,1988,2612,593,711,335,402,10,10,20,2,70,1.3),(29,0,50,1195,1637,289,414,158,226,15,15,19,1,70,1.25),(29,1,80,1637,2213,414,576,226,323,15,15,21,1,70,1.25),(29,2,90,2313,2916,576,711,323,414,15,15,21,1,70,1.25),(101,0,40,1152,1646,360,515,68,101,0,0,13,1,70,1.5),(101,1,55,1646,2352,515,736,101,155,0,0,15,1,70,1.5),(102,0,40,552,789,166,252,58,87,0,0,9,1,70,1),(102,1,55,789,1053,252,388,87,125,0,0,11,1,70,1),(103,0,40,775,1077,163,230,134,192,0,0,10,2,70,1.05),(103,1,55,1077,1437,230,329,192,275,0,0,12,2,70,1.05),(104,0,45,663,948,199,298,111,162,0,0,8,1,70,1.3),(104,1,60,948,1264,298,415,162,232,0,0,10,1,70,1.3),(104,2,70,1264,1580,415,520,232,290,0,0,10,1,70,1.3),(105,0,45,1344,1867,181,259,233,343,0,0,16,3,70,1.2),(105,1,60,1867,2489,259,360,343,490,0,0,18,3,70,1.2),(105,2,70,2489,3112,360,424,490,613,0,0,18,3,70,1.2),(106,0,45,781,1085,155,232,131,183,0,0,4,1,18,0.93),(106,1,60,1085,1447,232,323,183,262,0,0,6,1,18,0.93),(106,2,70,1447,1809,323,394,262,328,0,0,6,1,18,0.93),(107,0,50,922,1318,285,408,139,199,10,10,17,2,70,1.3),(107,1,70,1318,1712,408,552,199,273,10,10,19,2,70,1.3),(107,2,80,1712,2350,552,685,273,325,10,10,19,2,70,1.3),(108,0,50,783,1119,203,304,132,192,0,0,11,2,70,1.05),(108,1,70,1119,1492,304,423,192,275,0,0,13,2,70,1.05),(108,2,80,1492,1950,423,500,275,340,0,0,13,2,70,1.05),(109,0,50,1133,1553,298,427,138,192,0,0,21,2,70,1.2),(109,1,70,1553,2071,427,594,192,268,0,0,23,2,70,1.2),(109,2,80,2071,2630,594,752,268,335,0,0,23,3,70,1.2);
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
INSERT INTO `op_tag` VALUES (1,'輸出'),(1,'遠程位'),(4,'支援'),(4,'輸出'),(4,'近戰位'),(11,'生存'),(11,'輸出'),(11,'近戰位'),(17,'削弱'),(17,'輸出'),(17,'遠程位'),(27,'輸出'),(27,'近戰位'),(27,'防護'),(29,'生存'),(29,'輸出'),(29,'近戰位'),(101,'生存'),(101,'輸出'),(102,'輸出'),(103,'費用回復'),(104,'治療'),(104,'費用回復'),(105,'防護'),(106,'快速復活用'),(106,'防護'),(107,'削弱'),(107,'輸出'),(108,'控場'),(108,'費用回復'),(109,'生存'),(109,'群攻');
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
  `avatar_url` varchar(255) DEFAULT NULL,
  `portrait_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`operator_id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `operator_chk_1` CHECK ((`rarity` between 1 and 6))
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operator`
--

LOCK TABLES `operator` WRITE;
/*!40000 ALTER TABLE `operator` DISABLE KEYS */;
INSERT INTO `operator` VALUES (1,'能天使',6,'狙擊','速射手','遠程位','女','/static/images/avatars/exusiai.png','/static/images/portraits/exusiai.png'),(2,'黑',6,'狙擊','重射手','遠程位','女',NULL,NULL),(3,'安潔莉娜',6,'輔助','凝滯師','遠程位','女',NULL,NULL),(4,'銀灰',6,'近衛','領主','近戰位','男','/static/images/avatars/silverash.png','/static/images/portraits/silverash.png'),(5,'莫斯提馬',6,'術師','擴散術師','遠程位','女',NULL,NULL),(6,'夜鶯',6,'醫療','群愈師','遠程位','女',NULL,NULL),(7,'星熊',6,'重裝','鐵衛','近戰位','女',NULL,NULL),(8,'陳',6,'近衛','劍豪','近戰位','女',NULL,NULL),(9,'年',6,'重裝','鐵衛','近戰位','女',NULL,NULL),(10,'阿',6,'特種','怪傑','遠程位','男',NULL,NULL),(11,'煌',6,'近衛','強攻手','近戰位','女','/static/images/avatars/blaze.png','/static/images/portraits/blaze.png'),(12,'麥哲倫',6,'輔助','召喚師','遠程位','女',NULL,NULL),(13,'赫拉格',6,'近衛','武者','近戰位','男',NULL,NULL),(14,'斯卡蒂',6,'近衛','無畏者','近戰位','女',NULL,NULL),(15,'塞雷婭',6,'重裝','守護者','近戰位','女',NULL,NULL),(16,'閃靈',6,'醫療','醫師','遠程位','女',NULL,NULL),(17,'艾雅法拉',6,'術師','中堅術師','遠程位','女','/static/images/avatars/eyjafjalla.png','/static/images/portraits/eyjafjalla.png'),(18,'伊芙利特',6,'術師','轟擊術師','遠程位','女',NULL,NULL),(19,'推進之王',6,'先鋒','尖兵','近戰位','女',NULL,NULL),(20,'刻俄柏',6,'術師','中堅術師','遠程位','女',NULL,NULL),(21,'風笛',6,'先鋒','衝鋒手','近戰位','女',NULL,NULL),(22,'傀影',6,'特種','處決者','近戰位','男',NULL,NULL),(23,'溫蒂',6,'特種','推擊手','近戰位','女',NULL,NULL),(24,'W',6,'狙擊','炮手','遠程位','女',NULL,NULL),(25,'早露',6,'狙擊','攻城手','遠程位','女',NULL,NULL),(26,'鈴蘭',6,'輔助','凝滯師','遠程位','女',NULL,NULL),(27,'棘刺',6,'近衛','領主','近戰位','男','/static/images/avatars/thorns.png','/static/images/portraits/thorns.png'),(28,'森蚺',6,'重裝','決戰者','近戰位','女',NULL,NULL),(29,'史爾特爾',6,'近衛','術戰者','近戰位','女','/static/images/avatars/surtr.png','/static/images/portraits/surtr.png'),(30,'瑕光',6,'重裝','守護者','近戰位','女',NULL,NULL),(31,'迷迭香',6,'狙擊','投擲手','遠程位','女',NULL,NULL),(32,'泥岩',6,'重裝','不屈者','近戰位','女',NULL,NULL),(33,'山',6,'近衛','鬥士','近戰位','男',NULL,NULL),(34,'空弦',6,'狙擊','速射手','遠程位','女',NULL,NULL),(35,'嵯峨',6,'先鋒','尖兵','近戰位','女',NULL,NULL),(36,'夕',6,'術師','擴散術師','遠程位','女',NULL,NULL),(37,'灰燼',6,'狙擊','速射手','遠程位','女',NULL,NULL),(38,'異客',6,'術師','鏈術師','遠程位','男',NULL,NULL),(39,'凱爾希',6,'醫療','醫師','遠程位','女',NULL,NULL),(40,'歌蕾蒂婭',6,'特種','鉤索師','近戰位','女',NULL,NULL),(41,'濁心斯卡蒂',6,'輔助','吟遊者','遠程位','女',NULL,NULL),(42,'卡涅利安',6,'術師','陣法術師','遠程位','女',NULL,NULL),(43,'帕拉斯',6,'近衛','教官','近戰位','女',NULL,NULL),(44,'假日威龍陳',6,'狙擊','散射手','遠程位','女',NULL,NULL),(45,'水月',6,'特種','伏擊客','近戰位','男',NULL,NULL),(46,'琴柳',6,'先鋒','執旗手','近戰位','女',NULL,NULL),(47,'遠牙',6,'狙擊','神射手','遠程位','女',NULL,NULL),(48,'耀騎士臨光',6,'近衛','無畏者','近戰位','女',NULL,NULL),(49,'焰尾',6,'先鋒','尖兵','近戰位','女',NULL,NULL),(50,'鐧',6,'近衛','劍豪','近戰位','女',NULL,NULL),(51,'靈知',6,'輔助','削弱者','遠程位','男',NULL,NULL),(52,'老鯉',6,'特種','行商','近戰位','男',NULL,NULL),(53,'令',6,'輔助','召喚師','遠程位','女',NULL,NULL),(54,'澄閃',6,'術師','馭械術師','遠程位','女',NULL,NULL),(55,'菲亞梅塔',6,'狙擊','炮手','遠程位','女',NULL,NULL),(56,'號角',6,'重裝','要塞','近戰位','女',NULL,NULL),(57,'歸溟幽靈鯊',6,'特種','傀儡師','近戰位','女',NULL,NULL),(58,'艾麗妮',6,'近衛','劍豪','近戰位','女',NULL,NULL),(59,'流明',6,'醫療','療養師','遠程位','男',NULL,NULL),(60,'黑鍵',6,'術師','秘術師','遠程位','男',NULL,NULL),(61,'多蘿西',6,'特種','陷阱師','遠程位','女',NULL,NULL),(62,'百鍊嘉維爾',6,'近衛','強攻手','近戰位','女',NULL,NULL),(63,'鴻雪',6,'狙擊','重射手','遠程位','女',NULL,NULL),(64,'瑪恩納',6,'近衛','解放者','近戰位','男',NULL,NULL),(65,'白鐵',6,'輔助','工匠','近戰位','男',NULL,NULL),(66,'緘默德克薩斯',6,'特種','處決者','近戰位','女',NULL,NULL),(67,'斥罪',6,'重裝','不屈者','近戰位','女',NULL,NULL),(68,'伺夜',6,'先鋒','戰術家','遠程位','男',NULL,NULL),(69,'焰影葦草',6,'醫療','咒癒師','遠程位','女',NULL,NULL),(70,'重岳',6,'近衛','鬥士','近戰位','男',NULL,NULL),(71,'林',6,'術師','陣法術師','遠程位','女',NULL,NULL),(72,'仇白',6,'近衛','領主','近戰位','女',NULL,NULL),(73,'麒麟R夜刀',6,'特種','處決者','近戰位','女',NULL,NULL),(74,'伊內絲',6,'先鋒','情報官','近戰位','女',NULL,NULL),(75,'繆爾賽思',6,'先鋒','戰術家','遠程位','女',NULL,NULL),(76,'霍爾海雅',6,'術師','中堅術師','遠程位','女',NULL,NULL),(77,'淬羽赫默',6,'輔助','護佑者','遠程位','女',NULL,NULL),(78,'聖約送葬人',6,'近衛','收割者','近戰位','男',NULL,NULL),(79,'提豐',6,'狙擊','攻城手','遠程位','女',NULL,NULL),(80,'純燼艾雅法拉',6,'醫療','行醫','遠程位','女',NULL,NULL),(81,'琳琅詩懷雅',6,'特種','行商','近戰位','女',NULL,NULL),(82,'滌火傑西卡',6,'重裝','哨戒鐵衛','近戰位','女',NULL,NULL),(83,'赫德雷',6,'近衛','重劍手','近戰位','男',NULL,NULL),(84,'止頌',6,'近衛','無畏者','近戰位','男',NULL,NULL),(85,'塑心',6,'輔助','巫役','遠程位','女',NULL,NULL),(86,'薇薇安娜',6,'近衛','術戰者','近戰位','女',NULL,NULL),(87,'萊伊',6,'狙擊','獵手','遠程位','女',NULL,NULL),(88,'黍',6,'重裝','守護者','近戰位','女',NULL,NULL),(89,'左樂',6,'近衛','武者','近戰位','男',NULL,NULL),(90,'艾拉',6,'特種','陷阱師','遠程位','女',NULL,NULL),(91,'阿斯卡綸',6,'特種','伏擊客','近戰位','女',NULL,NULL),(92,'維什戴爾',6,'狙擊','投擲手','遠程位','女',NULL,NULL),(93,'邏各斯',6,'術師','中堅術師','遠程位','男',NULL,NULL),(94,'魔王',6,'輔助','吟遊者','遠程位','女',NULL,NULL),(95,'烏爾比安',6,'近衛','重劍手','近戰位','男',NULL,NULL),(96,'妮芙',6,'術師','本源術師','遠程位','女',NULL,NULL),(97,'佩佩',6,'近衛','撼地者','近戰位','女',NULL,NULL),(98,'娜仁圖亞',6,'狙擊','回環射手','遠程位','女',NULL,NULL),(99,'瑪露西爾',6,'術師','擴散術師','遠程位','女',NULL,NULL),(100,'維娜·維多利亞',6,'近衛','術戰者','近戰位','女',NULL,NULL),(101,'玫蘭莎',3,'近衛','劍匠','近戰位','女','/static/images/avatars/melantha.png','/static/images/portraits/melantha.png'),(102,'克洛絲',3,'狙擊','速射手','遠程位','女','/static/images/avatars/kroos.png','/static/images/portraits/kroos.png'),(103,'芬',3,'先鋒','衝鋒手','近戰位','女','/static/images/avatars/fang.png','/static/images/portraits/fang.png'),(104,'桃金娘',4,'先鋒','執旗手','近戰位','女','/static/images/avatars/myrtle.png','/static/images/portraits/myrtle.png'),(105,'蛇屠箱',4,'重裝','鐵衛','近戰位','女','/static/images/avatars/cuora.png','/static/images/portraits/cuora.png'),(106,'礫',4,'特種','處決者','近戰位','女','/static/images/avatars/gravel.png','/static/images/portraits/gravel.png'),(107,'拉普蘭德',5,'近衛','領主','近戰位','女','/static/images/avatars/lappland.png','/static/images/portraits/lappland.png'),(108,'德克薩斯',5,'先鋒','衝鋒手','近戰位','女','/static/images/avatars/texas.png','/static/images/portraits/texas.png'),(109,'幽靈鯊',5,'近衛','強攻手','近戰位','女','/static/images/avatars/specter.png','/static/images/portraits/specter.png');
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
INSERT INTO `operator_profile` VALUES (1,'幻象黑兔','石見舞菜香','企鵝物流員工，性格開朗活潑，極度熱愛蘋果派與各種派對，是值得信賴的信使。'),(4,'龍崎一','小西克幸','喀蘭貿易董事長，出身自雪境的貴族，是羅德島的堅實盟友。'),(11,'唯@W','中原麻衣','羅德島精英幹員，為人熱情直爽，擅長使用一把巨大的電鋸，總是在最前線衝鋒陷陣。'),(17,'Anmi','種田梨沙','天才火山學家，雖然深受礦石病折磨導致聽力受損，但依然保持著對學術與生活的熱愛。'),(27,'幻象黑兔','石川界人','伊比利亞出身的劍客，性格冷淡但心思縝密，精通名為「至高之術」的獨特劍法與毒素調配。'),(29,'ASK','堀江由衣','擁有一把名為「萊瓦汀」的雙手大劍，性格孤僻的神秘薩卡茲少女。'),(101,'miku','Machico','羅德島行動預備組A4組長，出身維多利亞富商家庭。'),(102,'miku','田所梓','羅德島行動預備組A1隊員，平時看起來總是懶洋洋的。'),(103,'miku','白石涼子','羅德島行動預備組A1組長，性格認真負責。'),(104,'龍崎いち','下地紫野','出身杜林地下城市，手持純白旗幟的元氣少女。'),(105,'一立里子','大和田仁美','身世不明，總是背著巨大背包的棒球少女。'),(106,'Liduke','立花理香','卡西米爾四階刺客，擅長隱蔽與暗殺行動。'),(107,'幻象黑兔','今井麻美','出身敘拉古的危險人物，與德克薩斯有著複雜的過去。'),(108,'幻象黑兔','田所梓','企鵝物流員工，沉默寡言但辦事極度可靠。'),(109,'Skade','淺倉杏美','深海獵人，精神狀態不穩定，戰鬥方式極其狂暴。');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill`
--

LOCK TABLES `skill` WRITE;
/*!40000 ALTER TABLE `skill` DISABLE KEYS */;
INSERT INTO `skill` VALUES (1,4,'真銀斬','大幅度擴大攻擊範圍，攻擊力提升，同時攻擊多個目標。','/static/images/skills/silverash_s3.png'),(2,17,'火山','隨機攻擊範圍內多個目標，攻擊力與攻速大幅提升。','/static/images/skills/eyjafjalla_s3.png'),(3,29,'黃昏','立即恢復所有生命值，攻擊範圍、攻擊力與攻擊目標數大幅提升，隨後每秒流失生命。','/static/images/skills/surtr_s3.png'),(4,1,'過載模式','攻擊變為 5 連射，攻擊間隔縮短，自動觸發。','/static/images/skills/exusiai_s3.png'),(5,27,'至高之術','攻擊範圍擴大，攻擊力與攻擊速度提升，第二次使用後持續時間無限','/static/images/skills/thorns_s3.png'),(6,11,'鏈鋸延伸模組','攻擊力與防禦力提升，攻擊距離加長，持續時間無限','/static/images/skills/blaze_s2.png'),(7,101,'攻擊力強化·α型','攻擊力提升','/static/images/skills/melantha_s1.png'),(8,102,'二連射·自動','下一次攻擊連射兩次','/static/images/skills/kroos_s1.png'),(9,103,'衝鋒號令·α型','獲得一定部署費用','/static/images/skills/fang_s1.png'),(10,104,'支援號令·β型','停止攻擊，持續回復部署費用','/static/images/skills/myrtle_s1.png'),(11,104,'治癒之翼','停止攻擊，回復費用並治療周圍友軍','/static/images/skills/myrtle_s2.png'),(12,105,'殼狀防禦','停止攻擊，防禦力大幅提升並每秒恢復生命','/static/images/skills/cuora_s2.png'),(13,106,'鼠群','部署後獲得一個吸收物理與法術傷害的護盾','/static/images/skills/gravel_s2.png'),(14,107,'日晷','攻擊力提升，獲得一定機率抵抗物理傷害','/static/images/skills/lappland_s1.png'),(15,107,'狼魂','攻擊力提升，攻擊變為法術傷害，可額外攻擊一個目標','/static/images/skills/lappland_s2.png'),(16,108,'劍雨','立即獲得部署費用，對範圍內敵人造成法術傷害並暈眩','/static/images/skills/texas_s2.png'),(17,109,'肉斬骨斷','攻擊力大幅提升，期間生命值不會低於1，技能結束後暈眩','/static/images/skills/specter_s2.png');
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
INSERT INTO `skill_material` VALUES (1,8,2,4),(1,9,1,10),(1,9,3,5),(1,10,2,6),(2,8,2,3),(2,9,1,10),(2,9,3,4),(2,10,2,6),(2,10,3,5),(3,8,3,4),(3,9,1,9),(3,9,2,4),(3,10,2,6),(3,10,3,4),(4,8,2,4),(4,8,3,4),(4,9,1,8),(4,9,2,4),(4,9,3,5),(4,10,2,6),(5,8,2,3),(5,9,1,12),(5,9,3,5),(5,10,2,6),(5,10,3,5),(6,8,3,4),(6,9,1,8),(6,9,2,4),(6,10,2,6),(6,10,3,4),(10,3,1,4),(10,3,14,4),(11,3,2,4),(11,3,31,5),(12,3,1,4),(12,3,13,3),(13,3,2,4),(13,3,15,4),(14,3,1,4),(14,3,28,5),(15,3,2,4),(15,3,30,4),(16,3,1,4),(16,3,15,5),(17,3,2,4),(17,3,18,6);
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
  `map_url` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stages`
--

LOCK TABLES `stages` WRITE;
/*!40000 ALTER TABLE `stages` DISABLE KEYS */;
INSERT INTO `stages` VALUES ('1-7','暴君',6,'/static/images/maps/stage_1_7.png','大批感染生物聚集的礦場。雖然個體脆弱，但數量眾多，請準備好充足的群體輸出火力。'),('10-6','雖非同族',21,'/static/images/maps/stage_10_6.png','倫蒂尼姆的城防炮正鎖定著這片區域。請引導炮火摧毀敵方陣線，或是利用地形掩護我方幹員。'),('11-4','何謂理想',21,'/static/images/maps/stage_11_4.png','所求的不過是一片可以生存的和平土地。'),('4-4','不要恐慌',15,'/static/images/maps/stage_4_4.png','出現了裝備高防禦護甲的重裝武裝人員。請部署術師幹員進行針對性的法術打擊。'),('7-15','游擊-2',18,'/static/images/maps/stage_7_15.png','游擊隊傳令兵將會大幅強化周圍敵軍的作戰能力，請務必盡早將其截殺，打亂敵方陣型。'),('JT8-2','睜眼，便是日暮',21,'/static/images/maps/stage_jt8_2.png','塔露拉的烈焰會點燃一切。請躲避無盡的熱浪，並注意保護好我方作戰幹員。'),('R8-11','落雪，浸黑國土',18,'/static/images/maps/stage_r8_11.png','漫天飛雪中潛藏著無數致命的危機。帝國前鋒精銳正在逼近，請全力掩護平民撤退。'),('S3-2','潛伏-2',15,'/static/images/maps/stage_s3_2.png','此區域存在具備光學迷彩隱匿能力的敵人。請注意阻擋時機，或利用高台幹員進行提前佈署。');
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

-- Dump completed on 2026-06-09 15:05:00
