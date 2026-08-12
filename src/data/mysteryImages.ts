export interface MysteryImage {
  key: string; // matches the mystery key, e.g. 'annunciation'
  file: string; // e.g. '/images/mysteries/annunciation.jpg'
  title: string; // painting title
  artist: string; // artist name
  source: string; // Wikimedia Commons page URL
}

export function getMysteryImage(key: string): MysteryImage | undefined {
  return mysteryImages.find((img) => img.key === key);
}

export const mysteryImages: MysteryImage[] = [
  // Joyful Mysteries
  {
    key: 'annunciation',
    file: '/images/mysteries/annunciation.jpg',
    title: 'The Annunciation',
    artist: 'Fra Angelico',
    source: 'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_The_Annunciation_-_WGA0455.jpg',
  },
  {
    key: 'visitation',
    file: '/images/mysteries/visitation.jpg',
    title: 'The Visitation',
    artist: 'Mariotto Albertinelli',
    source: 'https://commons.wikimedia.org/wiki/File:Mariotto_Albertinelli_-_Visitation_-_WGA0129.jpg',
  },
  {
    key: 'nativity',
    file: '/images/mysteries/nativity.jpg',
    title: 'Adoration of the Shepherds',
    artist: 'Gerard van Honthorst',
    source: 'https://commons.wikimedia.org/wiki/File:Gerard_van_Honthorst_-_Adoration_of_the_Shepherds_(1622).jpg',
  },
  {
    key: 'presentation',
    file: '/images/mysteries/presentation.jpg',
    title: 'Presentation of Jesus in the Temple',
    artist: 'Vittore Carpaccio',
    source: 'https://commons.wikimedia.org/wiki/File:Vittore_Carpaccio_074.jpg',
  },
  {
    key: 'finding',
    file: '/images/mysteries/finding.jpg',
    title: 'Christ among the Doctors (Disputation with the Doctors)',
    artist: 'Duccio di Buoninsegna',
    source: 'https://commons.wikimedia.org/wiki/File:Duccio_di_Buoninsegna_059.jpg',
  },

  // Luminous Mysteries
  {
    key: 'baptism',
    file: '/images/mysteries/baptism.jpg',
    title: 'The Baptism of Christ',
    artist: 'Piero della Francesca',
    source: 'https://commons.wikimedia.org/wiki/File:Piero_della_Francesca_045.jpg',
  },
  {
    key: 'cana',
    file: '/images/mysteries/cana.jpg',
    title: 'The Wedding at Cana',
    artist: 'Paolo Veronese',
    source: 'https://commons.wikimedia.org/wiki/File:Paolo_Veronese,_The_Wedding_at_Cana.JPG',
  },
  {
    key: 'proclamation',
    file: '/images/mysteries/proclamation.jpg',
    title: 'The Sermon on the Mount',
    artist: 'Carl Bloch',
    source: 'https://commons.wikimedia.org/wiki/File:Bloch-SermonOnTheMount.jpg',
  },
  {
    key: 'transfiguration',
    file: '/images/mysteries/transfiguration.jpg',
    title: 'The Transfiguration',
    artist: 'Raphael',
    source: 'https://commons.wikimedia.org/wiki/File:Transfiguration_Raphael.jpg',
  },
  {
    key: 'institution',
    file: '/images/mysteries/institution.jpg',
    title: 'The Last Supper',
    artist: 'Leonardo da Vinci',
    source: 'https://commons.wikimedia.org/wiki/File:Leonardo_da_Vinci_(1452-1519)_-_The_Last_Supper_(1495-1498).jpg',
  },

  // Sorrowful Mysteries
  {
    key: 'agony',
    file: '/images/mysteries/agony.jpg',
    title: 'Agony in the Garden',
    artist: 'Giovanni Bellini',
    source: 'https://commons.wikimedia.org/wiki/File:Bellini,Giovanni_-_Agony_in_the_Garden_-_National_Gallery.jpg',
  },
  {
    key: 'scourging',
    file: '/images/mysteries/scourging.jpg',
    title: 'The Flagellation of Christ',
    artist: 'Caravaggio',
    source: 'https://commons.wikimedia.org/wiki/File:The_Flagellation_of_Christ-Caravaggio_(1607).jpg',
  },
  {
    key: 'crowning',
    file: '/images/mysteries/crowning.jpg',
    title: 'Christ Crowned with Thorns',
    artist: 'Titian',
    source: 'https://commons.wikimedia.org/wiki/File:Titian_-_Christ_crowned_with_Thorns_-_Louvre.jpg',
  },
  {
    key: 'carrying',
    file: '/images/mysteries/carrying.jpg',
    title: 'Christ Carrying the Cross',
    artist: 'El Greco',
    source: 'https://commons.wikimedia.org/wiki/File:El_Greco_-_Christ_Carrying_the_Cross_-_Google_Art_Project.jpg',
  },
  {
    key: 'crucifixion',
    file: '/images/mysteries/crucifixion.jpg',
    title: 'Christ Crucified (Cristo crucificado)',
    artist: 'Diego Velázquez',
    source: 'https://commons.wikimedia.org/wiki/File:Cristo_crucificado.jpg',
  },

  // Glorious Mysteries
  {
    key: 'resurrection',
    file: '/images/mysteries/resurrection.jpg',
    title: 'The Resurrection',
    artist: 'Piero della Francesca',
    source: 'https://commons.wikimedia.org/wiki/File:Piero_della_Francesca_-_Resurrection_-_WGA17609.jpg',
  },
  {
    key: 'ascension',
    file: '/images/mysteries/ascension.jpg',
    title: 'The Ascension of Christ',
    artist: 'Benvenuto Tisi (il Garofalo)',
    source:
      'https://commons.wikimedia.org/wiki/File:Benvenuto_Tisi_il_Garofalo,_Ascensione,_1525_circa._Galleria_Barberini_-FG.jpg',
  },
  {
    key: 'pentecost',
    file: '/images/mysteries/pentecost.jpg',
    title: 'Pentecost (Descent of the Holy Spirit)',
    artist: 'Titian',
    source: 'https://commons.wikimedia.org/wiki/File:Tiziano_Pentecost%C3%A9s.jpg',
  },
  {
    key: 'assumption',
    file: '/images/mysteries/assumption.jpg',
    title: 'Assumption of the Virgin',
    artist: 'Titian',
    source: 'https://commons.wikimedia.org/wiki/File:Tizian_041.jpg',
  },
  {
    key: 'coronation',
    file: '/images/mysteries/coronation.jpg',
    title: 'The Coronation of the Virgin',
    artist: 'Diego Velázquez',
    source: 'https://commons.wikimedia.org/wiki/File:Diego_Vel%C3%A1zquez_-_Coronation_of_the_Virgin_-_Prado.jpg',
  },
];
