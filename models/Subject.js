const pool = require("./db");
class Subject {
  // hàm xây dựng đối tượng
  constructor(id, name, number_of_credits) {
    this.id = id;
    this.name = name;
    this.number_of_credits = number_of_credits;
  }

  static SELECT_ALL_QUERY = 'SELECT * FROM subject'

  static buildLimit = (page = null, item_per_page = null) => {
    let limit = "";
    if (page && item_per_page) {
      const row_index = (page - 1) * item_per_page;
      limit = `LIMIT ${row_index}, ${item_per_page}`;
    }
    return limit;
  };
  // hàm lấy tất cả dữ liệu trong bảng
  // trả về danh sách chứa các đối tượng subject
  // static là gọi từ class, vd: Subject.all, không cần phải new Subject(...).all()
  static all = async (page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(`${this.SELECT_ALL_QUERY} ${limit}`);
      return this.convertArrayToObject(rows);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  static convertArrayToObject = (rows) => {
    const subjects = rows.map(
      (row) => new Subject(row.id, row.name, row.number_of_credits)
    );
    return subjects;
  };

  static getByPattern = async (search, page = null, item_per_page = null) => {
    try {
      // xây dựng phân trang
      const limit = this.buildLimit(page, item_per_page);
      const [rows] = await pool.execute(
        `${this.SELECT_ALL_QUERY} WHERE name LIKE ? ${limit}`,
        [`%${search}%`]
      );
      return this.convertArrayToObject(rows);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  static save = async (data) => {
    try {
      const [result] = await pool.execute(
        "INSERT INTO subject VALUE(?,?,?)",
        [null, data.name, data.number_of_credits]
      );
      console.log(result);
      return result.insertId;
    } catch (error) {
      throw new Error(error);
    }
  };
  // tìm 1 dòng subject
  static find = async (id) => {
    try {
      const [rows] = await pool.execute(`${this.SELECT_ALL_QUERY} WHERE id=?`, [
        id,
      ]);
      // check nếu không có dòng nào thỏa mãn trong bảng subject
      if (rows.length === 0) {
        return null;
      }
      const row = rows[0];
      const subject = new Subject(row.id, row.name, row.number_of_credits);
      return subject;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  update = async () => {
    try {
      await pool.execute(
        "UPDATE subject SET name = ?, number_of_credits = ? WHERE id = ?",
        [this.name, this.number_of_credits, this.id]
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
  destroy = async () => {
    try {
      await pool.execute(
        "DELETE FROM subject WHERE id = ?",
        [this.id]
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
}

module.exports = Subject;
