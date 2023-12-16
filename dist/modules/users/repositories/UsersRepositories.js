"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mysql_1 = require("../../../mysql");
const uuid_1 = require("uuid");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
class UserRepository {
    create(request, response) {
        const { name, email, password } = request.body;
        mysql_1.pool.getConnection((err, connection) => {
            (0, bcrypt_1.hash)(password, 10, (err, hash) => {
                if (err) {
                    return response.status(500).json(err);
                }
                connection.query('SELECT email FROM users WHERE email = ?', [email], (error, result, fields) => {
                    if (error) {
                        connection.release();
                        return response.status(500).json(error);
                    }
                    if (result.length > 0) {
                        connection.release();
                        return response.status(409).json({ message: "E-mail já existe" });
                    }
                    // Se chegou até aqui, o e-mail não existe no banco de dados, então pode inserir o usuário normalmente
                    connection.query('INSERT INTO users (user_id, name, email, password) VALUES (?,?,?,?)', [(0, uuid_1.v4)(), name, email, hash], (error, result, fields) => {
                        connection.release();
                        if (error) {
                            return response.status(400).json(error);
                        }
                        response.status(200).json({ message: "Usuário criado com sucesso" });
                    });
                });
            });
        });
    }
    login(request, response) {
        const { email, password } = request.body;
        mysql_1.pool.getConnection((err, connection) => {
            connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results, filds) => {
                connection.release();
                if (error) {
                    return response.status(400).json({ error: "Erro na sua autenticação" });
                }
                if (results.length === 0) {
                    return response.status(400).json({ error: "Usuário não encontrado" });
                }
                (0, bcrypt_1.compare)(password, results[0].password, (err, result) => {
                    if (err) {
                        return response.status(400).json({ error: "Erro na sua autenticação" });
                    }
                    if (result) {
                        const token = (0, jsonwebtoken_1.sign)({
                            id: results[0].user_id,
                            email: results[0].email
                        }, process.env.SECRET, { expiresIn: "1d" });
                        return response.status(200).json({ token: token, message: "Autenticado com sucesso" });
                    }
                    else {
                        return response.status(400).json({ error: "Usuário ou senha incorretos. Verifique os dados e tente novamente." });
                    }
                });
            });
        });
    }
    getUser(request, response) {
        const decode = (0, jsonwebtoken_1.verify)(request.headers.authorization, process.env.SECRET);
        if (decode.email) {
            mysql_1.pool.getConnection((error, conn) => {
                conn.query('SELECT * FROM users WHERE email=?', [decode.email], (error, resultado, fields) => {
                    conn.release();
                    if (error) {
                        return response.status(400).send({
                            error: error,
                            response: null
                        });
                    }
                    return response.status(201).send({
                        user: {
                            nome: resultado[0].name,
                            email: resultado[0].email,
                            id: resultado[0].user_id,
                        }
                    });
                });
            });
        }
    }
}
exports.UserRepository = UserRepository;
