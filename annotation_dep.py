from subprocess import Popen
import sys

def main(genome_name, annotation_name, bed_file, ra_filename):
    p = Popen('hgLoadBed {} {} {}'.format(genome_name, annotation_name, bed_file))
    p.communicate()
    p = Popen('hgTrackDb -raName={} . {} trackDb /home/ubuntu/src/kent/src/hg/lib/trackDb.sql'.format(ra_filename, genome_name))
    p.communicate()
    p = Popen('hgFindSpec -raName=hydei.ra . droHyd1 hgFindSpec /home/ubuntu/src/kent/src/hg/lib/hgFindSpec.sql')
    p.communicate()
    
    
if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])