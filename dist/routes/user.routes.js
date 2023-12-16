"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const login_1 = require("../middleware/login");
const UsersRepositories_1 = require("../modules/users/repositories/UsersRepositories");
const userRoutes = (0, express_1.Router)();
exports.userRoutes = userRoutes;
const userRepository = new UsersRepositories_1.UserRepository();
userRoutes.post('/sign-up', (request, response) => {
    userRepository.create(request, response);
});
userRoutes.post('/sign-in', (request, response) => {
    userRepository.login(request, response);
});
userRoutes.get('/get-user', login_1.login, (request, response) => {
    userRepository.getUser(request, response);
});
