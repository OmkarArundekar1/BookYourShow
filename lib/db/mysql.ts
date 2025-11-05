import mysql from "mysql2/promise"

let connection: any

export async function getMySQLConnection() {
  if (connection) return connection

  connection = await mysql.createConnection({
    host: process.env.NEXT_PUBLIC_MYSQL_HOST,
    user: process.env.NEXT_PUBLIC_MYSQL_USER,
    password: process.env.NEXT_PUBLIC_MYSQL_PASSWORD,
    database: process.env.NEXT_PUBLIC_MYSQL_DATABASE,
    port: Number.parseInt(process.env.NEXT_PUBLIC_MYSQL_PORT || "3306"),
  })

  return connection
}

export const getConnection = getMySQLConnection

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const connection = await getMySQLConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("MySQL Query Error:", error)
    throw error
  }
}
