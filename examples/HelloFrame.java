import javax.swing.*;

public class HelloFrame extends JFrame {

    public HelloFrame() {
        setTitle("나의 첫 GUI");                                 // ① 제목 표시줄 글자
        setSize(320, 200);                                       // ② 창 크기 (가로 320, 세로 200)
        setLocationRelativeTo(null);                             // 화면 가운데에 띄우기
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);          // X를 누르면 프로그램 종료
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new HelloFrame().setVisible(true));
    }
}
