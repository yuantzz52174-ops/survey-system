# 基于 MongoDB 的问卷系统

## 项目简介

本项目是一个基于 **Node.js + Express + MongoDB** 实现的在线问卷系统，支持用户创建问卷、动态跳题填写、答案提交以及统计分析等功能。

系统实现了完整的前后端流程，包括：

- 用户注册与登录
- 问卷创建与管理
- 题目添加与规则校验
- 动态跳转逻辑（核心功能）
- 问卷填写与提交
- 统计结果展示

本项目为课程作业，重点体现 MongoDB 数据建模与后端逻辑设计能力。

---

## 技术栈

### 后端
- Node.js
- Express
- MongoDB
- Mongoose
- JWT（身份认证）
- bcryptjs（密码加密）

### 前端
- HTML
- CSS
- JavaScript

### 工具
- VS Code
- MongoDB Compass
- Thunder Client / REST Client
- GitHub

---

## 主要功能

### 1. 用户模块
- 用户注册
- 用户登录
- JWT 身份认证

---

### 2. 问卷模块
- 创建问卷
- 查看我的问卷
- 发布问卷
- 关闭问卷
- 支持匿名填写
- 支持截止时间
- 通过 accessCode 访问问卷

---

### 3. 题目模块

支持以下题型：

- 单选题
- 多选题
- 文字题
- 数字题

支持规则：

- 必答校验
- 多选数量限制
- 文本长度限制
- 数字范围限制
- 整数校验

---

### 4. 动态跳题（核心功能）

系统实现了基于数据驱动的跳转逻辑：

- 跳转规则存储在 MongoDB 中（jumpLogic）
- 根据用户答案动态匹配条件
- 自动决定下一题
- 防止非法路径提交

支持操作符：

- equals
- notEquals
- includes
- notIncludes
- greaterThan
- lessThan 等

---

### 5. 问卷填写模块

- 输入 accessCode 获取问卷
- 动态逐题作答
- 根据跳转逻辑自动跳题
- 最终提交问卷
- 校验答案合法性

---

### 6. 统计模块

支持：

- 整个问卷统计
- 单题统计

统计内容包括：

- 单选题：各选项人数
- 多选题：各选项选择次数
- 文本题：所有回答内容
- 数字题：平均值

## 项目结构
survey-system/

├── app.js

├── package.json

├── .env

├── README.md

├── config/

│   └── db.js

├── controllers/

├── models/

├── routes/

├── services/

├── middleware/

├── public/

│   ├── register.html

│   ├── login.html

│   ├── manage.html

│   ├── fill.html

│   ├── stats.html

│   ├── common.js

│   └── style.css

└── docs/

    ├── ai-log.md
    
    ├── report.md
    
    └── test-cases.md


