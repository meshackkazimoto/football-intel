import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Country } from '../country/country.entity';
import { Player } from '../player/player.entity';
import { BaseEntity } from 'src/infrastructure/database/base.entity';

@Entity('clubs')
export class Club extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  shortName?: string;

  @ManyToOne(() => Country, (country) => country.clubs, {
    nullable: false,
  })
  country: Country;

  @OneToMany(() => Player, (player) => player.club)
  players: Player[];
}
