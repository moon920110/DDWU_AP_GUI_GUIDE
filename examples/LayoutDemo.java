import javax.swing.*;
import java.awt.*;

public class LayoutDemo extends JFrame {

    public LayoutDemo() {
        setTitle("FlowLayout");

        // ▼ 이 부분만 바꿔 가며 실행해 보세요
        setLayout(new FlowLayout());
        for (int i = 1; i <= 5; i++) {
            add(new JButton("버튼 " + i));
        }
        // ▲

        setSize(420, 120);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LayoutDemo().setVisible(true));
    }
}
