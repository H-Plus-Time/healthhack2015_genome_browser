from subprocess import Popen
import sys

def main(genome_name):
    p = Popen('./build_new_database.py naming.csv')
    p.communicate()
    # p = Popen('./fa_to_agp.sh D_birchii.scafSeq.fill.FG {}'.format(genome_name))
    # p.communicate()
    
if __name__ == '__main__':
    main(sys.argv[1])
