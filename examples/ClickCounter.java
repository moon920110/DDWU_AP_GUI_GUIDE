import javax.swing.*;
import java.awt.*;

public class ClickCounter extends JFrame {
    private int count = 0;
    private JLabel countLabel = new JLabel("0번 눌렀어요", SwingConstants.CENTER);  // ① 글자 표시
    private JButton clickButton = new JButton("눌러 보세요");                       // ② 버튼

    public ClickCounter() {
        setTitle("클릭 카운터");
        setLayout(new BorderLayout());

        countLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 24));   // 글자 크기 24, 굵게
        clickButton.addActionListener(e -> {                            // ③ 버튼을 누르면 실행
            count++;
            countLabel.setText(count + "번 눌렀어요");                   // 라벨 글자 바꾸기
        });

        add(countLabel, BorderLayout.CENTER);
        add(clickButton, BorderLayout.SOUTH);

        setSize(320, 200);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new ClickCounter().setVisible(true));
    }
}
