import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DemandesModule } from './modules/demandes/demandes.module';
import { ActesModule } from './modules/actes/actes.module';
import { PaiementModule } from './modules/paiement/paiement.module';
import { HistoriqueModule } from './modules/historique/historique.module';
import { StatistiquesModule } from './modules/statistiques/statistiques.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    DemandesModule,
    ActesModule,
    PaiementModule,
    HistoriqueModule,
    StatistiquesModule,
    ConfigurationModule,
    DashboardModule,
  ],
})
export class AppModule {}
