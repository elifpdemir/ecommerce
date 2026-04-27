import java.sql.*;
public class CheckDb {
    public static void main(String[] args) throws Exception {
        String query = args.length > 0 ? args[0] : "SELECT email, password_hash, role_type FROM users";
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/ecommerce_analytics", "root", "");
        Statement stmt = conn.createStatement();
        boolean isSelect = query.trim().toUpperCase().startsWith("SELECT") || query.trim().toUpperCase().startsWith("DESCRIBE") || query.trim().toUpperCase().startsWith("SHOW");
        
        if (isSelect) {
            ResultSet rs = stmt.executeQuery(query);
            ResultSetMetaData rsmd = rs.getMetaData();
            int columnsNumber = rsmd.getColumnCount();
            while (rs.next()) {
                for (int i = 1; i <= columnsNumber; i++) {
                    if (i > 1) System.out.print(" | ");
                    String columnValue = rs.getString(i);
                    System.out.print(rsmd.getColumnName(i) + ": " + columnValue);
                }
                System.out.println("");
            }
        } else {
            int rows = stmt.executeUpdate(query);
            System.out.println("Rows affected: " + rows);
        }
        conn.close();
    }
}
