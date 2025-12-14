import Image from 'next/image'
import logo from '../images/logo.png'
import styles from '../styles/tab-info.module.css'

const TabInfo = () => {
    return (
        <div className={styles.container}>
            
            <div className={styles.bgOverlay}></div>

            
            <header className={styles.header}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoGlow}>
                        <Image
                            src={logo}
                            alt="Logo Học viện Kỹ thuật Mật mã"
                            width={140}
                            height={140}
                            priority
                            className={styles.logo}
                        />
                    </div>
                </div>

                <div className={styles.titleBox}>
                    <h1 className={styles.schoolName}>
                        <span className={styles.highlight}>HỌC VIỆN</span><br />
                        KỸ THUẬT MẬT MÃ
                    </h1>
                    <div className={styles.badge}>
                        Academy of Cryptography Techniques
                    </div>
                </div>
            </header>

            {/* NỘI DUNG CHÍNH */}
            <div className={styles.content}>
                <div className={styles.subjectCard}>
                    <h2 className={styles.subjectTitle}>
                        <span className={styles.icon}></span>
                        HỌC PHẦN: THỰC TẬP CƠ SỞ
                    </h2>
                </div>

                <div className={styles.teacherCard}>
                    <div className={styles.teacherAvatar}>
                        <div className={styles.avatarPlaceholder}>LV</div>
                    </div>
                    <div className={styles.teacherInfo}>
                        <h3>GIẢNG VIÊN HƯỚNG DẪN</h3>
                        <p className={styles.teacherName}>ThS. Lê Thị Hồng Vân</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TabInfo