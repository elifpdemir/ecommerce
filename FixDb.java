import java.sql.*;
public class FixDb {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ecommerce_analytics", "root", "");
        Statement stmt = conn.createStatement();
        int updated = stmt.executeUpdate("UPDATE users SET email = TRIM(email)");
        System.out.println("Updated " + updated + " users. Trimmed emails.");
    }
}
