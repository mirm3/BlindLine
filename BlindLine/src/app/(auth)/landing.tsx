import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function LandingScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const router = useRouter();

  const handleCardPress = () => {
    router.push('/(auth)/login');
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      accessible={true}
    >
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <FontAwesome
              name="train"
              size={60}
              color={tintColor}
              accessibilityLabel="BlindLine train logo"
            />
          </View>
          <Text style={styles.appName}>{t('landing.appName')}</Text>
          <Text style={styles.tagline}>{t('landing.tagline')}</Text>
          <Text style={styles.description}>{t('landing.description')}</Text>
        </View>

        {/* Main Action Cards */}
        <View style={styles.actionCardsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: tintColor }]}
            onPress={handleCardPress}
            accessibilityRole="button"
            accessibilityLabel={t('landing.needAssistance.description')}
            accessibilityHint="Opens the login screen"
          >
            <View style={[styles.iconCircle, { backgroundColor: tintColor }]}>
              <FontAwesome name="eye-slash" size={32} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>{t('landing.needAssistance.title')}</Text>
            <Text style={styles.cardDescription}>
              {t('landing.needAssistance.description')}
            </Text>
            <View style={[styles.cardButton, { backgroundColor: tintColor }]}>
              <Text style={styles.cardButtonText}>{t('landing.needAssistance.button')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#4CAF50' }]}
            onPress={handleCardPress}
            accessibilityRole="button"
            accessibilityLabel={t('landing.wantToHelp.description')}
            accessibilityHint="Opens the login screen"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' }]}>
              <FontAwesome name="heart" size={32} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>{t('landing.wantToHelp.title')}</Text>
            <Text style={styles.cardDescription}>
              {t('landing.wantToHelp.description')}
            </Text>
            <View style={[styles.cardButton, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.cardButtonText}>{t('landing.wantToHelp.button')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('landing.howItWorks.title')}</Text>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#E3F2FD' }]}>
              <FontAwesome name="calendar-plus-o" size={24} color={tintColor} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('landing.howItWorks.planYourTrip.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('landing.howItWorks.planYourTrip.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
              <FontAwesome name="handshake-o" size={24} color="#4CAF50" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('landing.howItWorks.getMatched.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('landing.howItWorks.getMatched.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#FFF3E0' }]}>
              <FontAwesome name="comments" size={24} color="#FF9800" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('landing.howItWorks.connectAndConfirm.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('landing.howItWorks.connectAndConfirm.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#F3E5F5' }]}>
              <FontAwesome name="train" size={24} color="#9C27B0" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('landing.howItWorks.travelTogether.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('landing.howItWorks.travelTogether.description')}
              </Text>
            </View>
          </View>
        </View>

        {/* Partner Section */}
        <View style={styles.partnerSection}>
          <Text style={styles.partnerText}>{t('landing.partner.initiative')}</Text>
          <Text style={styles.partnerSubtext}>
            {t('landing.partner.accessibleTravel')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(47, 149, 220, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.7,
  },
  actionCardsContainer: {
    gap: 16,
    marginTop: 20,
  },
  actionCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  partnerSection: {
    marginTop: 30,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  partnerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  partnerSubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
});
