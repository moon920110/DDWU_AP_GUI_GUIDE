// GradeBook.java
import java.util.ArrayList;
import java.util.List;

// 화면과 상관없이 데이터 저장과 계산만 맡는 클래스
public class GradeBook {
    private List<Student> students = new ArrayList<>();

    public void add(Student s) {
        students.add(s);
    }

    public void remove(int index) {
        students.remove(index);
    }

    public double average() {
        if (students.isEmpty()) return 0;
        int sum = 0;
        for (Student s : students) {
            sum += s.getScore();
        }
        return (double) sum / students.size();
    }
}
